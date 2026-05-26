<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PracticeSchedule;
use App\Models\Coach;
use App\Models\Athlete;
use App\Models\Attendance;
use Illuminate\Http\Request;

class PracticeScheduleController extends Controller
{
    public function loadPracticeSchedules(Request $request)
    {
        $user = $request->user();

        $query = PracticeSchedule::with(['coach', 'approvedBy'])
            ->where('tbl_practice_schedules.is_deleted', false);

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $query->where('coach_id', $coach->coach_id);
            }
        } elseif ($user->role === 'Athlete') {
            $athlete = Athlete::where('user_id', $user->user_id)->first();
            if ($athlete) {
                // Athletes should only see Approved AND Completed schedules
                $query->where('sport', $athlete->sport)
                      ->whereIn('status', ['Approved', 'Completed']);
            }
        }

        $practiceSchedules = $query->orderBy('practice_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get();

        return response()->json([
            'practice_schedules' => $practiceSchedules
        ], 200);
    }

    public function storePracticeSchedule(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'coach_id' => ['required', 'exists:tbl_coaches,coach_id'],
            'venue' => ['required', 'max:100'],
            'practice_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'total_players' => ['required', 'integer', 'min:1'],
            'sport' => ['required', 'max:55'],
            'notes' => ['nullable', 'string'],
        ], [
            'practice_date.after_or_equal' => 'Practice date must be today or a future date.',
            'end_time.after' => 'End time must be after start time.',
        ]);

        if ($user->role === 'Coach') {
            $validated['status'] = 'Pending';
        } else {
            $validated['status'] = $request->input('status', 'Pending');
        }

        PracticeSchedule::create($validated);

        $message = $user->role === 'Coach'
            ? 'Practice venue booking submitted! Waiting for admin approval.'
            : 'Practice schedule created successfully!';

        return response()->json(['message' => $message], 200);
    }

    public function updatePracticeSchedule(Request $request, PracticeSchedule $practiceSchedule)
    {
        $user = $request->user();

        $validated = $request->validate([
            'coach_id' => ['required', 'exists:tbl_coaches,coach_id'],
            'venue' => ['required', 'max:100'],
            'practice_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'total_players' => ['required', 'integer', 'min:1'],
            'sport' => ['required', 'max:55'],
            'notes' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:Pending,Approved,Declined,Completed,Cancelled']], [
'end_time.after' => 'End time must be after start time.',
]);
    if ($user->role === 'Coach') {
        if (!in_array($practiceSchedule->status, ['Pending', 'Declined'])) {
            return response()->json([
                'message' => 'Cannot edit approved or completed schedules.'
            ], 403);
        }
        $validated['status'] = 'Pending';
        $validated['admin_notes'] = null;
        $validated['approved_by'] = null;
    }

    $practiceSchedule->update($validated);

    return response()->json([
        'message' => 'Practice schedule updated successfully.',
        'practice_schedule' => $practiceSchedule
    ], 200);
}

public function approvePracticeSchedule(Request $request, PracticeSchedule $practiceSchedule)
{
    $user = $request->user();

    if ($user->role !== 'Admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'admin_notes' => ['nullable', 'string', 'max:500']
    ]);

    $practiceSchedule->update([
        'status' => 'Approved',
        'admin_notes' => $validated['admin_notes'] ?? null,
        'approved_by' => $user->user_id
    ]);

    return response()->json([
        'message' => 'Practice schedule approved successfully!',
        'practice_schedule' => $practiceSchedule->load(['coach', 'approvedBy'])
    ], 200);
}

public function declinePracticeSchedule(Request $request, PracticeSchedule $practiceSchedule)
{
    $user = $request->user();

    if ($user->role !== 'Admin') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'admin_notes' => ['required', 'string', 'max:500']
    ]);

    $practiceSchedule->update([
        'status' => 'Declined',
        'admin_notes' => $validated['admin_notes'],
        'approved_by' => $user->user_id
    ]);

    return response()->json([
        'message' => 'Practice schedule declined.',
        'practice_schedule' => $practiceSchedule->load(['coach', 'approvedBy'])
    ], 200);
}

// ✅ UPDATED: Recalculate all affected athletes when a practice is deleted
public function destroyPracticeSchedule(PracticeSchedule $practiceSchedule)
{
    // Get all athletes who have attendance for this practice
    $affectedAthleteIds = Attendance::where('practice_schedule_id', $practiceSchedule->practice_schedule_id)
        ->pluck('athlete_id')
        ->unique();

    // Soft delete the practice schedule
    $practiceSchedule->update([
        'is_deleted' => true
    ]);

    // ✅ CRITICAL FIX: Recalculate attendance percentage for all affected athletes
    $attendanceController = new AttendanceController();
    foreach ($affectedAthleteIds as $athleteId) {
        $attendanceController->recalculateAthletePercentage($athleteId);
    }

    return response()->json([
        'message' => 'Practice schedule cancelled successfully.'
    ], 200);
}
}
