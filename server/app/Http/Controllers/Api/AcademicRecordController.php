<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\AcademicRecord;
use App\Models\EligibilityReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AcademicRecordController extends Controller
{
    public function uploadGrades(Request $request)
    {
        try {
            $validated = $request->validate([
                'athlete_id'    => 'required|exists:tbl_athletes,athlete_id',
                'semester_term' => 'required|string|max:100',
                'grade_image'   => 'required|image|mimes:jpeg,png,jpg|max:5120',
                'courses'       => 'required|string'
            ]);

            $courses = json_decode($validated['courses'], true);

            if (!is_array($courses) || empty($courses)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => ['courses' => ['Invalid courses data']]
                ], 422);
            }

            foreach ($courses as $index => $course) {
                if (!isset($course['course_code']) || empty(trim($course['course_code']))) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors'  => ['courses' => ["Course code is required at position " . ($index + 1)]]
                    ], 422);
                }

                if (!isset($course['course_name']) || empty(trim($course['course_name']))) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors'  => ['courses' => ["Course name is required at position " . ($index + 1)]]
                    ], 422);
                }

                if (!isset($course['grade'])) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors'  => ['courses' => ["Grade is required at position " . ($index + 1)]]
                    ], 422);
                }

                $gradeRaw = $course['grade'];
                if (is_string($gradeRaw) && !is_numeric($gradeRaw)) {
                    $upper = strtoupper(trim($gradeRaw));
                    if ($upper !== 'INC' && $upper !== 'DRP') {
                        return response()->json([
                            'message' => 'Validation failed',
                            'errors'  => ['courses' => ["Invalid grade at position " . ($index + 1) . ". String grades must be INC or DRP."]]
                        ], 422);
                    }
                } else {
                    $grade = floatval($gradeRaw);
                    if ($grade < 1.0 || ($grade > 3.0 && $grade != 5.0)) {
                        return response()->json([
                            'message' => 'Validation failed',
                            'errors'  => ['courses' => ["Grade must be between 1.0-3.0 or 5.0 at position " . ($index + 1) . " (received: {$grade})"]]
                        ], 422);
                    }
                }

                if (!isset($course['credits']) || !is_numeric($course['credits'])) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors'  => ['courses' => ["Valid credits is required at position " . ($index + 1)]]
                    ], 422);
                }

                $credits = intval($course['credits']);
                if ($credits < 1 || $credits > 6) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors'  => ['courses' => ["Credits must be between 1-6 at position " . ($index + 1)]]
                    ], 422);
                }
            }

            $athlete = Athlete::findOrFail($validated['athlete_id']);

            $user = Auth::user();
            if ($user->role === 'Athlete' && $athlete->user_id !== $user->user_id) {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $imagePath = null;
            $result    = DB::transaction(function () use ($request, $validated, $courses, $athlete, $user, &$imagePath) {
                $imagePath   = $request->file('grade_image')->store('academic_grades', 'public');
                $calculation = $this->calculateGrades($courses);

                $normalizedCourses = array_map(function ($course) {
                    $gradeRaw = $course['grade'];
                    if (is_string($gradeRaw) && !is_numeric($gradeRaw)) {
                        $course['grade'] = strtoupper(trim($gradeRaw));
                    }
                    return $course;
                }, $courses);

                $academicRecord = AcademicRecord::create([
                    'athlete_id'            => $validated['athlete_id'],
                    'semester_term'         => $validated['semester_term'],
                    'grade_image_path'      => $imagePath,
                    'courses'               => $normalizedCourses,
                    'calculated_percentage' => $calculation['percentage'],
                    'gwa_grade'             => $calculation['gwa'],
                    'total_units'           => $calculation['total_units'],
                    'status'                => 'pending',
                    'upload_date'           => now()
                ]);

                $this->updateAthleteEligibility($athlete, $calculation['percentage'], $academicRecord);

                return [
                    'academic_record' => $academicRecord,
                    'calculation'     => $calculation,
                ];
            });

            return response()->json([
                'message'         => 'Grades uploaded successfully',
                'academic_record' => $result['academic_record'],
                'athlete_status'  => $athlete->fresh()->academic_status,
                'calculation'     => $result['calculation'],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            Log::error('Grade upload failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to upload grades',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    private function calculateGrades(array $courses)
    {
        // ✅ FIX: Use string keys instead of float keys.
        //
        //    PHP silently casts float array keys to integers when the float
        //    is a whole number: 1.0 → 1, 2.0 → 2, 3.0 → 3.
        //    Non-whole floats are also cast to int by truncation:
        //    1.25 → 1, 1.5 → 1, 1.75 → 1, 2.25 → 2, etc.
        //
        //    This means the original map:
        //      [1.0=>98, 1.25=>94, 1.5=>89, 1.75=>86, 2.0=>83, ...]
        //    was actually stored as:
        //      [1=>86, 2=>80, 3=>75]   ← each key overwritten by last value
        //
        //    So every grade lookup returned 86 (last value written to key 1),
        //    80 (last value written to key 2), or 75 (key 3) — regardless of
        //    the actual grade. All courses with grade 1.x returned 86%.
        //
        //    String keys are never truncated. (string)1.0 in PHP = "1",
        //    (string)1.25 = "1.25", so we cast the grade to string before
        //    lookup to match the string keys in the map exactly.
        $gradeToPercentage = [
            '1'    => 98,   // grade 1.0  → (string)1.0 = "1"
            '1.25' => 94,
            '1.5'  => 89,
            '1.75' => 86,
            '2'    => 83,   // grade 2.0  → (string)2.0 = "2"
            '2.25' => 80,
            '2.5'  => 77,
            '2.75' => 74,
            '3'    => 75,   // grade 3.0  → (string)3.0 = "3"
        ];

        $totalPercentagePoints = 0;
        $totalUnits            = 0;
        $totalGradePoints      = 0;
        $hasFailedCourse       = false;

        foreach ($courses as $course) {
            $gradeRaw = $course['grade'];
            $credits  = intval($course['credits']);

            if (is_string($gradeRaw) && !is_numeric($gradeRaw)) {
                $upper = strtoupper(trim($gradeRaw));
                if ($upper === 'INC' || $upper === 'DRP') {
                    $hasFailedCourse = true;
                    continue;
                }
            }

            $grade = floatval($gradeRaw);

            if ($grade >= 5.0) {
                $hasFailedCourse = true;
                continue;
            }

            if ($grade >= 1.0 && $grade <= 3.0) {
                // ✅ Cast to string to match the string-keyed map.
                //    (string)floatval("1") = "1"   → maps to 98 ✓
                //    (string)floatval("1.25") = "1.25" → maps to 94 ✓
                //    (string)floatval("1.75") = "1.75" → maps to 86 ✓
                $gradeKey               = (string) $grade;
                $percentage             = $gradeToPercentage[$gradeKey] ?? 75;
                $totalPercentagePoints += ($percentage * $credits);
                $totalGradePoints      += ($grade * $credits);
                $totalUnits            += $credits;
            }
        }

        $gwa        = $totalUnits > 0 ? ($totalGradePoints      / $totalUnits) : 5.00;
        $percentage = $totalUnits > 0 ? ($totalPercentagePoints / $totalUnits) : 0;

        if ($hasFailedCourse) {
            $percentage = 0;
        }

        return [
            'gwa'               => round($gwa, 2),
            'percentage'        => round($percentage, 2),
            'total_units'       => $totalUnits,
            'has_failed_course' => $hasFailedCourse
        ];
    }

    private function updateAthleteEligibility(Athlete $athlete, float $percentage, AcademicRecord $academicRecord)
    {
        $rawPreviousStatus = $athlete->academic_status;
        $allowedStatuses   = ['Eligible', 'Under Review', 'Ineligible'];
        $previousStatus    = in_array($rawPreviousStatus, $allowedStatuses)
            ? $rawPreviousStatus
            : 'Eligible';

        $hasFailedCourse = false;

        foreach ($academicRecord->courses as $course) {
            $gradeRaw = $course['grade'];
            if (is_string($gradeRaw) && !is_numeric($gradeRaw)) {
                $upper = strtoupper(trim($gradeRaw));
                if ($upper === 'INC' || $upper === 'DRP') {
                    $hasFailedCourse = true;
                    break;
                }
            } elseif (floatval($gradeRaw) >= 5.0) {
                $hasFailedCourse = true;
                break;
            }
        }

        if ($percentage >= 75 && !$hasFailedCourse) {
            $newStatus = 'Eligible';
            $athlete->update([
                'academic_status'          => 'Eligible',
                'current_grade_percentage' => $percentage,
                'last_grade_upload_date'   => now(),
                'grace_period_start_date'  => null,
                'grace_period_end_date'    => null,
                'coach_review_notes'       => null
            ]);
        } else {
            $newStatus      = 'Under Review';
            $gracePeriodEnd = Carbon::now()->addDays(14);
            $reviewReason   = [];

            if ($percentage < 75) $reviewReason[] = "Grade percentage ({$percentage}%) is below 75%";
            if ($hasFailedCourse) $reviewReason[] = "Contains failed courses (INC/DRP)";

            $athlete->update([
                'academic_status'          => 'Under Review',
                'current_grade_percentage' => $percentage,
                'last_grade_upload_date'   => now(),
                'grace_period_start_date'  => now(),
                'grace_period_end_date'    => $gracePeriodEnd,
                'coach_review_notes'       => implode('. ', $reviewReason)
            ]);
        }

        $reviewReason = ($percentage < 75 || $hasFailedCourse)
            ? "Grade percentage: {$percentage}%. " . ($hasFailedCourse ? "Contains failed courses." : "Below 75% threshold.")
            : "Grade percentage meets eligibility requirements";

        EligibilityReview::create([
            'athlete_id'         => $athlete->athlete_id,
            'academic_record_id' => $academicRecord->academic_record_id,
            'previous_status'    => $previousStatus,
            'new_status'         => $newStatus,
            'grade_percentage'   => $percentage,
            'review_reason'      => $reviewReason,
            'coach_decision'     => ($percentage < 75 || $hasFailedCourse) ? 'pending' : 'approved',
        ]);
    }

    public function getAthleteAcademicRecords($athleteId)
    {
        try {
            $user    = Auth::user();
            $athlete = Athlete::findOrFail($athleteId);

            if ($user->role === 'Athlete' && $athlete->user_id !== $user->user_id) {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $academicRecords = AcademicRecord::where('athlete_id', $athleteId)
                ->with(['verifier'])
                ->orderBy('upload_date', 'desc')
                ->get();

            return response()->json([
                'academic_records' => $academicRecords,
                'athlete'          => $athlete
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load academic records',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function downloadGradeImage($academicRecordId)
    {
        try {
            $academicRecord = AcademicRecord::findOrFail($academicRecordId);
            $user           = Auth::user();

            if ($user->role === 'Athlete') {
                $athlete = Athlete::where('user_id', $user->user_id)->first();
                if (!$athlete || $athlete->athlete_id !== $academicRecord->athlete_id) {
                    return response()->json(['message' => 'Unauthorized access'], 403);
                }
            }

            $filePath = storage_path('app/public/' . $academicRecord->grade_image_path);

            if (!file_exists($filePath)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->download($filePath);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to download image',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function approveRecord($academicRecordId)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'Coach' && $user->role !== 'Admin') {
                return response()->json([
                    'message' => 'Unauthorized. Only coaches and admins can approve records.'
                ], 403);
            }

            $academicRecord = AcademicRecord::findOrFail($academicRecordId);
            $athlete        = Athlete::findOrFail($academicRecord->athlete_id);

            if ($user->role === 'Coach') {
                $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
                if (!$coach || $athlete->coach_id !== $coach->coach_id) {
                    return response()->json([
                        'message' => 'You can only approve records for your own athletes'
                    ], 403);
                }
            }

            $academicRecord->update([
                'status'             => 'approved',
                'verified_by'        => $user->user_id,
                'verification_date'  => now(),
                'verification_notes' => 'Approved by ' . $user->role
            ]);

            $remainingPending = AcademicRecord::where('athlete_id', $academicRecord->athlete_id)
                ->where('status', 'pending')
                ->count();

            if ($remainingPending === 0 && $athlete->academic_status === 'Under Review') {
                $athlete->update([
                    'academic_status'         => 'Eligible',
                    'grace_period_start_date' => null,
                    'grace_period_end_date'   => null,
                    'coach_review_notes'      => 'Approved by coach after review',
                    'reviewed_by'             => $user->user_id,
                    'review_date'             => now(),
                ]);
            }

            return response()->json([
                'message'         => 'Academic record approved successfully',
                'academic_record' => $academicRecord->fresh(['verifier'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Approval failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to approve record',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function rejectRecord(Request $request, $academicRecordId)
    {
        try {
            $validated = $request->validate([
                'notes' => 'required|string|max:1000'
            ]);

            $user = Auth::user();

            if ($user->role !== 'Coach' && $user->role !== 'Admin') {
                return response()->json([
                    'message' => 'Unauthorized. Only coaches and admins can reject records.'
                ], 403);
            }

            $academicRecord = AcademicRecord::findOrFail($academicRecordId);
            $athlete        = Athlete::findOrFail($academicRecord->athlete_id);

            if ($user->role === 'Coach') {
                $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
                if (!$coach || $athlete->coach_id !== $coach->coach_id) {
                    return response()->json([
                        'message' => 'You can only reject records for your own athletes'
                    ], 403);
                }
            }

            $academicRecord->update([
                'status'             => 'rejected',
                'verified_by'        => $user->user_id,
                'verification_date'  => now(),
                'verification_notes' => $validated['notes']
            ]);

            $athlete->update([
                'academic_status'         => 'Ineligible',
                'grace_period_start_date' => null,
                'grace_period_end_date'   => null,
                'coach_review_notes'      => $validated['notes'],
                'reviewed_by'             => $user->user_id,
                'review_date'             => now(),
            ]);

            return response()->json([
                'message'         => 'Academic record rejected',
                'academic_record' => $academicRecord->fresh(['verifier'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Rejection failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to reject record',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function getAthletesNeedingReview()
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'Coach' && $user->role !== 'Admin') {
                return response()->json(['message' => 'Unauthorized access'], 403);
            }

            $athleteIdsWithPendingRecords = AcademicRecord::where('status', 'pending')
                ->pluck('athlete_id')
                ->unique()
                ->values();

            $query = Athlete::with([
                'gender',
                'user',
                'coach',
                'academicRecords' => function ($q) {
                    $q->where('status', 'pending')
                        ->orderBy('upload_date', 'desc');
                }
            ])
                ->where(function ($q) use ($athleteIdsWithPendingRecords) {
                    $q->whereIn('athlete_id', $athleteIdsWithPendingRecords)
                        ->orWhere('academic_status', 'Under Review');
                })
                ->where('is_deleted', false);

            if ($user->role === 'Coach') {
                $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
                if ($coach) {
                    $query->where('coach_id', $coach->coach_id);
                } else {
                    return response()->json(['athletes' => []], 200);
                }
            }

            $athletes = $query->get();

            return response()->json(['athletes' => $athletes], 200);
        } catch (\Exception $e) {
            Log::error('getAthletesNeedingReview failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to load athletes needing review',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function reviewEligibility(Request $request, $athleteId)
    {
        try {
            $validated = $request->validate([
                'decision' => 'required|in:approved,denied',
                'notes'    => 'nullable|string|max:1000'
            ]);

            $user    = Auth::user();
            $athlete = Athlete::findOrFail($athleteId);

            if ($user->role !== 'Coach' && $user->role !== 'Admin') {
                return response()->json([
                    'message' => 'Only coaches and admins can review eligibility'
                ], 403);
            }

            if ($user->role === 'Coach') {
                $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
                if (!$coach || $athlete->coach_id !== $coach->coach_id) {
                    return response()->json([
                        'message' => 'You can only review your own athletes'
                    ], 403);
                }
            }

            $newStatus = $validated['decision'] === 'approved' ? 'Eligible' : 'Ineligible';

            $athlete->update([
                'academic_status'         => $newStatus,
                'coach_review_notes'      => $validated['notes'] ?? null,
                'reviewed_by'             => $user->user_id,
                'review_date'             => now(),
                'grace_period_start_date' => null,
                'grace_period_end_date'   => null
            ]);

            $pendingReview = EligibilityReview::where('athlete_id', $athleteId)
                ->where('coach_decision', 'pending')
                ->latest()
                ->first();

            if ($pendingReview) {
                $pendingReview->update([
                    'coach_decision' => $validated['decision'],
                    'coach_notes'    => $validated['notes'] ?? null,
                    'reviewed_by'    => $user->user_id,
                    'review_date'    => now(),
                    'new_status'     => $newStatus
                ]);
            }

            return response()->json([
                'message' => 'Review completed successfully',
                'athlete' => $athlete->fresh(['gender', 'user', 'coach'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Review failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to complete review',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function expireGracePeriods()
    {
        try {
            $expiredAthletes = Athlete::where('academic_status', 'Under Review')
                ->whereNotNull('grace_period_end_date')
                ->where('grace_period_end_date', '<', now())
                ->get();

            $count = 0;
            foreach ($expiredAthletes as $athlete) {
                $athlete->update([
                    'academic_status'    => 'Ineligible',
                    'coach_review_notes' => 'Grace period expired without coach review',
                    'review_date'        => now()
                ]);

                $pendingReview = EligibilityReview::where('athlete_id', $athlete->athlete_id)
                    ->where('coach_decision', 'pending')
                    ->latest()
                    ->first();

                if ($pendingReview) {
                    $pendingReview->update([
                        'coach_decision' => 'denied',
                        'coach_notes'    => 'Automatically denied due to expired grace period',
                        'review_date'    => now(),
                        'new_status'     => 'Ineligible'
                    ]);
                }

                $count++;
            }

            return response()->json([
                'message' => "Expired {$count} grace periods",
                'count'   => $count
            ], 200);
        } catch (\Exception $e) {
            Log::error('Grace period expiration failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to expire grace periods',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
