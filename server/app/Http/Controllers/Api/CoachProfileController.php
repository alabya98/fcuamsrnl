<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coach;
use App\Models\User;
use App\Models\Athlete;
use App\Models\PracticeSchedule;
use App\Models\Event;
use Illuminate\Http\Request;

class CoachProfileController extends Controller
{
    /**
     * Single endpoint that returns all coach dashboard data in one request.
     * Replaces 4 separate calls that were queued by php artisan serve.
     */
    public function getAllDashboardData(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        // ── Stats ──────────────────────────────────────────────
        $totalAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->count();

        $activeAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('athlete_status', 'active')
            ->count();

        $inactiveAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('athlete_status', 'inactive')
            ->count();

        $eligibleAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('academic_status', 'Eligible')
            ->where('is_deleted', false)
            ->count();

        $upcomingPractices = PracticeSchedule::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('practice_date', '>=', now()->toDateString())
            ->whereIn('status', ['Pending', 'Approved'])
            ->count();

        $upcomingEventsCount = Event::where('sport', $coach->sports_coached)
            ->where('is_deleted', false)
            ->where('event_date', '>=', now()->toDateString())
            ->count();

        // ── Athletes ───────────────────────────────────────────
        $athletes = Athlete::with(['gender'])
            ->where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->orderBy('last_name', 'asc')
            ->get();

        // ── Practice Schedules ─────────────────────────────────
        $practiceSchedules = PracticeSchedule::with(['coach'])
            ->where('coach_id', $coach->coach_id)
            ->where('status', 'Approved')
            ->where('practice_date', '>=', now()->toDateString())
            ->where('is_deleted', false)
            ->orderBy('practice_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'coach' => $coach,
            'stats' => [
                'total_athletes'     => $totalAthletes,
                'active_athletes'    => $activeAthletes,
                'inactive_athletes'  => $inactiveAthletes,
                'eligible_athletes'  => $eligibleAthletes,
                'upcoming_practices' => $upcomingPractices,
                'upcoming_events'    => $upcomingEventsCount,
            ],
            'athletes'           => $athletes,
            'practice_schedules' => $practiceSchedules,
        ], 200);
    }

    public function getMyProfile(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        return response()->json(['coach' => $coach], 200);
    }

    public function getMyAthletes(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        $athletes = Athlete::with(['gender'])
            ->where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->orderBy('last_name', 'asc')
            ->get();

        return response()->json(['athletes' => $athletes], 200);
    }

    public function getMyPracticeSchedules(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        $practiceSchedules = PracticeSchedule::with(['coach'])
            ->where('coach_id', $coach->coach_id)
            ->where('status', 'Approved')
            ->where('practice_date', '>=', now()->toDateString())
            ->where('is_deleted', false)
            ->orderBy('practice_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json(['practice_schedules' => $practiceSchedules], 200);
    }

    public function getUpcomingEvents(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        $events = Event::where('sport', $coach->sports_coached)
            ->where('is_deleted', false)
            ->where('event_date', '>=', now()->toDateString())
            ->orderBy('event_date', 'asc')
            ->limit(10)
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function getDashboardStats(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        $totalAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->count();

        $activeAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('athlete_status', 'active')
            ->count();

        $inactiveAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('athlete_status', 'inactive')
            ->count();

        $eligibleAthletes = Athlete::where('coach_id', $coach->coach_id)
            ->where('academic_status', 'Eligible')
            ->where('is_deleted', false)
            ->count();

        $upcomingPractices = PracticeSchedule::where('coach_id', $coach->coach_id)
            ->where('is_deleted', false)
            ->where('practice_date', '>=', now()->toDateString())
            ->whereIn('status', ['Pending', 'Approved'])
            ->count();

        $upcomingEvents = Event::where('sport', $coach->sports_coached)
            ->where('is_deleted', false)
            ->where('event_date', '>=', now()->toDateString())
            ->count();

        return response()->json([
            'stats' => [
                'total_athletes'     => $totalAthletes,
                'active_athletes'    => $activeAthletes,
                'inactive_athletes'  => $inactiveAthletes,
                'eligible_athletes'  => $eligibleAthletes,
                'upcoming_practices' => $upcomingPractices,
                'upcoming_events'    => $upcomingEvents,
            ]
        ], 200);
    }

    public function updateMyProfile(Request $request)
    {
        $user = $request->user();

        $coach = Coach::where('user_id', $user->user_id)
            ->where('is_deleted', false)
            ->first();

        if (!$coach) {
            return response()->json([
                'message' => 'Coach profile not found.'
            ], 404);
        }

        $validated = $request->validate([
            'first_name'     => 'sometimes|required|string|max:55',
            'middle_name'    => 'nullable|string|max:55',
            'last_name'      => 'sometimes|required|string|max:55',
            'suffix_name'    => 'nullable|string|max:55',
            'position'       => 'sometimes|required|string|max:55',
            'sports_coached' => 'sometimes|required|string|max:55',
            'department'     => 'sometimes|required|string|max:55',
            'contact_email'  => 'sometimes|required|email|max:255',
        ]);

        $coach->update($validated);

        if (isset($validated['first_name']) || isset($validated['last_name'])) {
            User::where('user_id', $user->user_id)->update([
                'first_name' => $validated['first_name'] ?? $user->first_name,
                'last_name'  => $validated['last_name'] ?? $user->last_name,
            ]);
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'coach'   => $coach->fresh()
        ], 200);
    }
}
