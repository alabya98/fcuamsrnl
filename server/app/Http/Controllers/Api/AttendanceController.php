<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\PracticeSchedule;
use App\Models\Athlete;
use App\Models\Coach;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Get attendance for a specific practice schedule
    public function getAttendanceByPractice(Request $request, $practiceScheduleId)
    {
        $user = $request->user();

        $practiceSchedule = PracticeSchedule::with(['coach', 'attendances.athlete'])
            ->findOrFail($practiceScheduleId);

        // Authorization check for coaches
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $attendance = $practiceSchedule->attendances()
            ->with(['athlete.gender', 'markedBy'])
            ->get();

        return response()->json([
            'attendance' => $attendance,
            'practice_schedule' => $practiceSchedule
        ], 200);
    }

    // Mark attendance for multiple athletes (with validation)
    public function markAttendance(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'practice_schedule_id' => ['required', 'exists:tbl_practice_schedules,practice_schedule_id'],
            'attendances' => ['required', 'array', 'min:1'],
            'attendances.*.athlete_id' => ['required', 'exists:tbl_athletes,athlete_id'],
            'attendances.*.status' => ['required', 'in:Present,Absent,Excused,Late'],
            'attendances.*.notes' => ['nullable', 'string', 'max:500'],
            'is_draft' => ['boolean']
        ]);

        $isDraft = $validated['is_draft'] ?? false;

        // Get practice schedule
        $practiceSchedule = PracticeSchedule::findOrFail($validated['practice_schedule_id']);

        // VALIDATION 1: Check if practice schedule is approved
        if (!in_array($practiceSchedule->status, ['Approved', 'Completed'])) {
            return response()->json([
                'message' => 'Can only mark attendance for approved or completed practice schedules.'
            ], 422);
        }

        // VALIDATION 2: Prevent marking attendance for future practices
        $practiceDate = Carbon::parse($practiceSchedule->practice_date);
        $now = Carbon::now();

        if ($practiceDate->isFuture() && $practiceDate->diffInHours($now) > 24) {
            return response()->json([
                'message' => 'Cannot mark attendance more than 24 hours before the practice date.'
            ], 422);
        }

        // VALIDATION 3: Time window validation (24 hours before to 48 hours after)
        $hoursSincePractice = $now->diffInHours($practiceDate, false);
        if ($hoursSincePractice < -24 || $hoursSincePractice > 48) {
            return response()->json([
                'message' => 'Attendance can only be marked within 24 hours before to 48 hours after the practice.'
            ], 422);
        }

        // VALIDATION 4: Authorization check for coaches
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized to mark attendance for this practice.'], 403);
            }
        }

        // VALIDATION 5: Ensure only assigned athletes can be marked
        $eligibleAthletes = Athlete::where('sport', $practiceSchedule->sport)
            ->where('is_deleted', false)
            ->pluck('athlete_id')
            ->toArray();

        $requestedAthleteIds = collect($validated['attendances'])->pluck('athlete_id')->toArray();
        $invalidAthletes = array_diff($requestedAthleteIds, $eligibleAthletes);

        if (count($invalidAthletes) > 0) {
            return response()->json([
                'message' => 'Some athletes are not eligible for this practice.',
                'invalid_athlete_ids' => array_values($invalidAthletes)
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($validated['attendances'] as $attendanceData) {
                Attendance::updateOrCreate(
                    [
                        'practice_schedule_id' => $validated['practice_schedule_id'],
                        'athlete_id' => $attendanceData['athlete_id']
                    ],
                    [
                        'attendance_status' => $attendanceData['status'],
                        'attendance_notes' => $attendanceData['notes'] ?? null,
                        'practice_date' => $practiceSchedule->practice_date,
                        'marked_by' => $user->user_id,
                        'marked_at' => now(),
                        'is_submitted' => !$isDraft,
                        'submitted_at' => !$isDraft ? now() : null
                    ]
                );

                // ✅ NEW: Update consecutive absences tracking
                if (!$isDraft) {
                    $this->updateConsecutiveAbsences($attendanceData['athlete_id'], $attendanceData['status']);
                }
            }

            // Update practice attendance status FIRST
            $this->updatePracticeAttendanceStatus($validated['practice_schedule_id']);

            // Update practice schedule status to completed if all submitted
            if (!$isDraft) {
                // Check if attendance is now completed
                $updatedSchedule = PracticeSchedule::find($validated['practice_schedule_id']);
                if ($updatedSchedule->attendance_status === 'completed') {
                    $practiceSchedule->update(['status' => 'Completed']);
                }
            }

            // Update attendance percentages for all affected athletes
            $affectedAthleteIds = collect($validated['attendances'])->pluck('athlete_id')->unique();
            foreach ($affectedAthleteIds as $athleteId) {
                $this->recalculateAthletePercentage($athleteId);
            }

            DB::commit();

            return response()->json([
                'message' => $isDraft ? 'Attendance saved as draft!' : 'Attendance submitted successfully!'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Attendance marking failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to mark attendance.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Bulk mark all as present
    public function bulkMarkAllPresent(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'practice_schedule_id' => ['required', 'exists:tbl_practice_schedules,practice_schedule_id'],
            'is_draft' => ['boolean']
        ]);

        $isDraft = $validated['is_draft'] ?? false;
        $practiceSchedule = PracticeSchedule::findOrFail($validated['practice_schedule_id']);

        // Authorization check
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        try {
            DB::beginTransaction();

            // Get all eligible athletes
            $athletes = Athlete::where('sport', $practiceSchedule->sport)
                ->where('is_deleted', false)
                ->get();

            foreach ($athletes as $athlete) {
                Attendance::updateOrCreate(
                    [
                        'practice_schedule_id' => $validated['practice_schedule_id'],
                        'athlete_id' => $athlete->athlete_id
                    ],
                    [
                        'attendance_status' => 'Present',
                        'attendance_notes' => null,
                        'practice_date' => $practiceSchedule->practice_date,
                        'marked_by' => $user->user_id,
                        'marked_at' => now(),
                        'is_submitted' => !$isDraft,
                        'submitted_at' => !$isDraft ? now() : null
                    ]
                );

                // ✅ NEW: Update consecutive absences
                if (!$isDraft) {
                    $this->updateConsecutiveAbsences($athlete->athlete_id, 'Present');
                }

                $this->recalculateAthletePercentage($athlete->athlete_id);
            }

            // Update practice attendance status
            $this->updatePracticeAttendanceStatus($validated['practice_schedule_id']);

            if (!$isDraft) {
                $practiceSchedule->update(['status' => 'Completed']);
            }

            DB::commit();

            return response()->json([
                'message' => $isDraft ? 'All marked as present (draft)!' : 'All marked as present and submitted!'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to mark all as present.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Bulk mark all as absent
    public function bulkMarkAllAbsent(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'practice_schedule_id' => ['required', 'exists:tbl_practice_schedules,practice_schedule_id'],
            'is_draft' => ['boolean']
        ]);

        $isDraft = $validated['is_draft'] ?? false;
        $practiceSchedule = PracticeSchedule::findOrFail($validated['practice_schedule_id']);

        // Authorization check
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        try {
            DB::beginTransaction();

            $athletes = Athlete::where('sport', $practiceSchedule->sport)
                ->where('is_deleted', false)
                ->get();

            foreach ($athletes as $athlete) {
                Attendance::updateOrCreate(
                    [
                        'practice_schedule_id' => $validated['practice_schedule_id'],
                        'athlete_id' => $athlete->athlete_id
                    ],
                    [
                        'attendance_status' => 'Absent',
                        'attendance_notes' => null,
                        'practice_date' => $practiceSchedule->practice_date,
                        'marked_by' => $user->user_id,
                        'marked_at' => now(),
                        'is_submitted' => !$isDraft,
                        'submitted_at' => !$isDraft ? now() : null
                    ]
                );

                // ✅ NEW: Update consecutive absences
                if (!$isDraft) {
                    $this->updateConsecutiveAbsences($athlete->athlete_id, 'Absent');
                }

                $this->recalculateAthletePercentage($athlete->athlete_id);
            }

            $this->updatePracticeAttendanceStatus($validated['practice_schedule_id']);

            if (!$isDraft) {
                $practiceSchedule->update(['status' => 'Completed']);
            }

            DB::commit();

            return response()->json([
                'message' => $isDraft ? 'All marked as absent (draft)!' : 'All marked as absent and submitted!'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to mark all as absent.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Copy attendance from previous practice
    public function copyFromPreviousPractice(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'practice_schedule_id' => ['required', 'exists:tbl_practice_schedules,practice_schedule_id'],
            'is_draft' => ['boolean']
        ]);

        $isDraft = $validated['is_draft'] ?? false;
        $practiceSchedule = PracticeSchedule::findOrFail($validated['practice_schedule_id']);

        // Authorization check
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        try {
            // Find the most recent previous practice for the same sport and coach
            $previousPractice = PracticeSchedule::where('coach_id', $practiceSchedule->coach_id)
                ->where('sport', $practiceSchedule->sport)
                ->where('practice_date', '<', $practiceSchedule->practice_date)
                ->where('practice_schedule_id', '!=', $practiceSchedule->practice_schedule_id)
                ->where('is_deleted', false)
                ->orderBy('practice_date', 'desc')
                ->first();

            if (!$previousPractice) {
                return response()->json([
                    'message' => 'No previous practice found to copy from.'
                ], 404);
            }

            // Get attendance from previous practice
            $previousAttendances = Attendance::where('practice_schedule_id', $previousPractice->practice_schedule_id)
                ->get();

            if ($previousAttendances->isEmpty()) {
                return response()->json([
                    'message' => 'Previous practice has no attendance records.'
                ], 404);
            }

            DB::beginTransaction();

            foreach ($previousAttendances as $prevAttendance) {
                // Check if athlete still exists and is active
                $athlete = Athlete::where('athlete_id', $prevAttendance->athlete_id)
                    ->where('is_deleted', false)
                    ->first();

                if ($athlete) {
                    Attendance::updateOrCreate(
                        [
                            'practice_schedule_id' => $validated['practice_schedule_id'],
                            'athlete_id' => $prevAttendance->athlete_id
                        ],
                        [
                            'attendance_status' => $prevAttendance->attendance_status,
                            'attendance_notes' => null, // Don't copy notes
                            'practice_date' => $practiceSchedule->practice_date,
                            'marked_by' => $user->user_id,
                            'marked_at' => now(),
                            'is_submitted' => !$isDraft,
                            'submitted_at' => !$isDraft ? now() : null
                        ]
                    );

                    // ✅ NEW: Update consecutive absences
                    if (!$isDraft) {
                        $this->updateConsecutiveAbsences($prevAttendance->athlete_id, $prevAttendance->attendance_status);
                    }

                    $this->recalculateAthletePercentage($prevAttendance->athlete_id);
                }
            }

            $this->updatePracticeAttendanceStatus($validated['practice_schedule_id']);

            if (!$isDraft) {
                $practiceSchedule->update(['status' => 'Completed']);
            }

            DB::commit();

            return response()->json([
                'message' => $isDraft
                    ? 'Attendance copied from previous practice (draft)!'
                    : 'Attendance copied from previous practice and submitted!',
                'previous_practice_date' => $previousPractice->practice_date->format('Y-m-d')
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Copy from previous practice failed:', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'Failed to copy attendance from previous practice.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get athlete's attendance history
    public function getAthleteAttendance(Request $request, $athleteId)
    {
        $user = $request->user();

        try {
            // Authorization check
            if ($user->role === 'Athlete') {
                $athlete = Athlete::where('user_id', $user->user_id)->first();
                if (!$athlete || $athlete->athlete_id != $athleteId) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Coach') {
                $coach = Coach::where('user_id', $user->user_id)->first();
                $athlete = Athlete::findOrFail($athleteId);

                if (!$coach || !str_contains($coach->sports_coached, $athlete->sport)) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }

            $athlete = Athlete::findOrFail($athleteId);

            // Only get submitted attendance AND filter out deleted practice schedules
            $attendances = Attendance::where('athlete_id', $athleteId)
                ->where('is_submitted', true) // Only count submitted
                ->whereHas('practiceSchedule', function($query) {
                    $query->where('is_deleted', false);
                })
                ->with(['practiceSchedule.coach', 'markedBy'])
                ->orderBy('marked_at', 'desc')
                ->get();

            $totalPractices = $attendances->count();
            $presentCount = $attendances->where('attendance_status', 'Present')->count();
            $attendancePercentage = $totalPractices > 0 ? round(($presentCount / $totalPractices) * 100, 2) : 0;

            $stats = [
                'total_practices' => $totalPractices,
                'present' => $presentCount,
                'absent' => $attendances->where('attendance_status', 'Absent')->count(),
                'excused' => $attendances->where('attendance_status', 'Excused')->count(),
                'late' => $attendances->where('attendance_status', 'Late')->count(),
                'attendance_percentage' => $attendancePercentage
            ];

            return response()->json([
                'attendances' => $attendances,
                'stats' => $stats,
                'athlete' => $athlete
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load attendance data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get all attendance records (Admin only)
    public function getAllAttendance(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attendances = Attendance::with([
            'athlete.gender',
            'practiceSchedule.coach',
            'markedBy'
        ])
            ->orderBy('marked_at', 'desc')
            ->paginate(50);

        return response()->json($attendances, 200);
    }

    // Update single attendance record
    public function updateAttendance(Request $request, $attendanceId)
    {
        $user = $request->user();

        $validated = $request->validate([
            'status' => ['required', 'in:Present,Absent,Excused,Late'],
            'notes' => ['nullable', 'string', 'max:500']
        ]);

        $attendance = Attendance::with('practiceSchedule')->findOrFail($attendanceId);

        // Check if attendance is locked (submitted)
        if ($attendance->is_submitted && $user->role !== 'Admin') {
            return response()->json([
                'message' => 'Cannot edit submitted attendance. Please contact an administrator.'
            ], 403);
        }

        // Authorization check for coaches
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $attendance->practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Store old status to check if it changed
        $oldStatus = $attendance->attendance_status;

        $attendance->update([
            'attendance_status' => $validated['status'],
            'attendance_notes' => $validated['notes'] ?? $attendance->attendance_notes,
            'marked_by' => $user->user_id,
            'marked_at' => now()
        ]);

        // ✅ NEW: Update consecutive absences if status changed and attendance is submitted
        if ($oldStatus !== $validated['status'] && $attendance->is_submitted) {
            $this->updateConsecutiveAbsences($attendance->athlete_id, $validated['status']);
        }

        $this->recalculateAthletePercentage($attendance->athlete_id);
        $this->updatePracticeAttendanceStatus($attendance->practice_schedule_id);

        return response()->json([
            'message' => 'Attendance updated successfully.',
            'attendance' => $attendance->load(['athlete', 'practiceSchedule', 'markedBy'])
        ], 200);
    }

    // Delete attendance record
    public function deleteAttendance(Request $request, $attendanceId)
    {
        $user = $request->user();

        $attendance = Attendance::with('practiceSchedule')->findOrFail($attendanceId);

        // Check if attendance is locked
        if ($attendance->is_submitted && $user->role !== 'Admin') {
            return response()->json([
                'message' => 'Cannot delete submitted attendance. Please contact an administrator.'
            ], 403);
        }

        // Authorization check
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $attendance->practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        } elseif ($user->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $athleteId = $attendance->athlete_id;
        $practiceScheduleId = $attendance->practice_schedule_id;

        $attendance->delete();

        // ✅ NEW: Recalculate consecutive absences after deletion
        $this->recalculateConsecutiveAbsencesFromHistory($athleteId);

        $this->recalculateAthletePercentage($athleteId);
        $this->updatePracticeAttendanceStatus($practiceScheduleId);

        return response()->json([
            'message' => 'Attendance record deleted successfully.'
        ], 200);
    }

    // Get athletes eligible for attendance
    public function getEligibleAthletes(Request $request, $practiceScheduleId)
    {
        $user = $request->user();

        $practiceSchedule = PracticeSchedule::findOrFail($practiceScheduleId);

        // Authorization check
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach || $practiceSchedule->coach_id !== $coach->coach_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $athletes = Athlete::with(['gender'])
            ->where(function($query) use ($practiceSchedule) {
                $query->where('sport', $practiceSchedule->sport)
                      ->orWhere('sport', 'LIKE', '%' . trim($practiceSchedule->sport) . '%');
            })
            ->where('is_deleted', false)
            ->get();

        $existingAttendance = Attendance::where('practice_schedule_id', $practiceScheduleId)
            ->get()
            ->keyBy('athlete_id');

        $athletesWithAttendance = $athletes->map(function ($athlete) use ($existingAttendance) {
            $attendance = $existingAttendance->get($athlete->athlete_id);

            return [
                'athlete_id' => $athlete->athlete_id,
                'first_name' => $athlete->first_name,
                'middle_name' => $athlete->middle_name,
                'last_name' => $athlete->last_name,
                'suffix_name' => $athlete->suffix_name,
                'school_id' => $athlete->school_id,
                'position' => $athlete->position,
                'sport' => $athlete->sport,
                'gender' => $athlete->gender,
                'athlete_status' => $athlete->athlete_status ?? 'active', // ✅ NEW
                'consecutive_absences' => $athlete->consecutive_absences ?? 0, // ✅ NEW
                'attendance_status' => $attendance ? $attendance->attendance_status : null,
                'attendance_notes' => $attendance ? $attendance->attendance_notes : null,
                'is_submitted' => $attendance ? $attendance->is_submitted : false
            ];
        });

        return response()->json([
            'athletes' => $athletesWithAttendance,
            'practice_schedule' => $practiceSchedule
        ], 200);
    }

    // Check if attendance can be marked for a practice schedule
    public function checkAttendanceEligibility(Request $request, $practiceScheduleId)
    {
        $practiceSchedule = PracticeSchedule::findOrFail($practiceScheduleId);

        $practiceDate = Carbon::parse($practiceSchedule->practice_date);
        $now = Carbon::now();

        // Calculate hours difference
        $hoursDiff = $now->diffInHours($practiceDate, false);

        // Check if within time window (-24 to +48 hours)
        $canMark = ($hoursDiff >= -24 && $hoursDiff <= 48);

        $message = '';
        $timeStatus = '';

        if ($practiceDate->isFuture() && $hoursDiff < -24) {
            // Too early
            $daysUntil = $practiceDate->diffInDays($now);
            $hoursUntil = abs($hoursDiff);
            $timeStatus = 'too_early';
            $message = "Cannot mark attendance yet. Practice is scheduled for {$practiceDate->format('M d, Y')} ({$daysUntil} days from now). You can start marking attendance 24 hours before the practice.";
        } elseif ($practiceDate->isPast() && $hoursDiff > 48) {
            // Too late
            $daysSince = $now->diffInDays($practiceDate);
            $hoursSince = $hoursDiff;
            $timeStatus = 'too_late';
            $message = "Cannot mark attendance. Practice was {$daysSince} days ago ({$practiceDate->format('M d, Y')}). Attendance must be marked within 48 hours after the practice.";
        } elseif ($hoursDiff >= -24 && $hoursDiff < 0) {
            // Can mark - within 24 hours before
            $hoursUntil = abs($hoursDiff);
            $timeStatus = 'upcoming';
            $message = "Practice is in {$hoursUntil} hours. You can mark attendance now.";
        } elseif ($hoursDiff >= 0 && $hoursDiff <= 48) {
            // Can mark - within 48 hours after
            $hoursAgo = $hoursDiff;
            $timeStatus = 'ongoing_or_recent';
            if ($hoursAgo < 1) {
                $message = "Practice is happening now. You can mark attendance.";
            } else {
                $message = "Practice was {$hoursAgo} hours ago. You can still mark attendance.";
            }
        }

        return response()->json([
            'can_mark' => $canMark,
            'time_status' => $timeStatus,
            'message' => $message,
            'practice_date' => $practiceDate->format('Y-m-d H:i:s'),
            'current_time' => $now->format('Y-m-d H:i:s'),
            'hours_difference' => round($hoursDiff, 1),
            'practice_schedule' => [
                'practice_schedule_id' => $practiceSchedule->practice_schedule_id,
                'venue' => $practiceSchedule->venue,
                'practice_date' => $practiceSchedule->practice_date,
                'start_time' => $practiceSchedule->start_time,
                'end_time' => $practiceSchedule->end_time,
                'status' => $practiceSchedule->status
            ]
        ], 200);
    }

    // Recalculate all percentages (Admin only)
    public function recalculateAllPercentages(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $athletes = Athlete::where('is_deleted', false)->get();
            $updated = 0;

            foreach ($athletes as $athlete) {
                $this->recalculateAthletePercentage($athlete->athlete_id);
                // ✅ NEW: Also recalculate consecutive absences from history
                $this->recalculateConsecutiveAbsencesFromHistory($athlete->athlete_id);
                $updated++;
            }

            return response()->json([
                'message' => "Successfully recalculated attendance percentages and consecutive absences for {$updated} athletes."
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to recalculate percentages.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ PUBLIC METHOD: Recalculate athlete attendance percentage
    // This is called from PracticeScheduleController when a schedule is deleted
    public function recalculateAthletePercentage($athleteId)
    {
        // Only count attendance where:
        // 1. Attendance is submitted
        // 2. Practice schedule is NOT deleted
        $attendances = Attendance::where('athlete_id', $athleteId)
            ->where('is_submitted', true)
            ->whereHas('practiceSchedule', function($query) {
                $query->where('is_deleted', false);
            })
            ->get();

        $totalPractices = $attendances->count();
        $presentCount = $attendances->where('attendance_status', 'Present')->count();
        $percentage = $totalPractices > 0 ? round(($presentCount / $totalPractices) * 100, 2) : 0;

        Athlete::where('athlete_id', $athleteId)->update([
            'attendance_percentage' => $percentage
        ]);
    }

    // ✅ NEW: Update consecutive absences and athlete status
    private function updateConsecutiveAbsences($athleteId, $attendanceStatus)
    {
        $athlete = Athlete::findOrFail($athleteId);

        if ($attendanceStatus === 'Absent') {
            // Increment consecutive absences
            $newConsecutiveAbsences = $athlete->consecutive_absences + 1;

            $athlete->update([
                'consecutive_absences' => $newConsecutiveAbsences
            ]);

            // Check if threshold reached (3 consecutive absences)
            if ($newConsecutiveAbsences >= 3 && $athlete->athlete_status === 'active') {
                $athlete->update([
                    'athlete_status' => 'inactive',
                    'inactive_since' => now()
                ]);

                Log::info("Athlete {$athlete->athlete_id} ({$athlete->first_name} {$athlete->last_name}) marked as inactive due to {$newConsecutiveAbsences} consecutive absences");
            }
        } else {
            // Reset consecutive absences if present, late, or excused
            if ($athlete->consecutive_absences > 0) {
                $athlete->update([
                    'consecutive_absences' => 0
                ]);

                Log::info("Athlete {$athlete->athlete_id} consecutive absences reset to 0 (status: {$attendanceStatus})");
            }
        }
    }

    // ✅ NEW: Recalculate consecutive absences from attendance history
    // This is useful when attendance is deleted or when fixing data
    private function recalculateConsecutiveAbsencesFromHistory($athleteId)
    {
        $athlete = Athlete::findOrFail($athleteId);

        // Get all submitted attendance ordered by practice date (most recent first)
        $attendances = Attendance::where('athlete_id', $athleteId)
            ->where('is_submitted', true)
            ->whereHas('practiceSchedule', function($query) {
                $query->where('is_deleted', false);
            })
            ->with('practiceSchedule')
            ->get()
            ->sortByDesc(function($attendance) {
                return $attendance->practiceSchedule->practice_date;
            });

        $consecutiveAbsences = 0;

        // Count consecutive absences from most recent practices
        foreach ($attendances as $attendance) {
            if ($attendance->attendance_status === 'Absent') {
                $consecutiveAbsences++;
            } else {
                // Break on first non-absent status
                break;
            }
        }

        // Update athlete record
        $updates = [
            'consecutive_absences' => $consecutiveAbsences
        ];

        // Auto-update status based on consecutive absences
        if ($consecutiveAbsences >= 3 && $athlete->athlete_status === 'active') {
            $updates['athlete_status'] = 'inactive';
            $updates['inactive_since'] = now();
            Log::info("Athlete {$athlete->athlete_id} auto-marked as inactive (recalculated {$consecutiveAbsences} consecutive absences)");
        } elseif ($consecutiveAbsences < 3 && $athlete->athlete_status === 'inactive' && is_null($athlete->status_changed_by)) {
            // Only auto-activate if status wasn't manually changed
            $updates['athlete_status'] = 'active';
            $updates['inactive_since'] = null;
            Log::info("Athlete {$athlete->athlete_id} auto-marked as active (recalculated {$consecutiveAbsences} consecutive absences)");
        }

        $athlete->update($updates);
    }

    // Helper: Update practice attendance status
    private function updatePracticeAttendanceStatus($practiceScheduleId)
    {
        $practiceSchedule = PracticeSchedule::findOrFail($practiceScheduleId);

        // Get all eligible athletes for this sport
        $totalEligible = Athlete::where('sport', $practiceSchedule->sport)
            ->where('is_deleted', false)
            ->count();

        // Count SUBMITTED attendance only
        $submittedCount = Attendance::where('practice_schedule_id', $practiceScheduleId)
            ->where('is_submitted', true)
            ->count();

        // Get total marked (including drafts) for partial detection
        $markedCount = Attendance::where('practice_schedule_id', $practiceScheduleId)->count();

        // Determine status
        $status = 'pending';

        // If ANY attendance is marked (submitted or draft), but not all submitted
        if ($markedCount > 0 && $submittedCount < $totalEligible) {
            $status = 'partial';
        }
        // If all eligible athletes have SUBMITTED attendance
        elseif ($submittedCount >= $totalEligible && $totalEligible > 0) {
            $status = 'completed';
        }

        $practiceSchedule->update(['attendance_status' => $status]);
    }
}
