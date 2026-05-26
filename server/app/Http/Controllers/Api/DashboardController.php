<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\Coach;
use App\Models\Event;
use App\Models\Record;
use App\Models\Sport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Single endpoint that returns all dashboard data in one request.
     * This replaces the 5 separate calls that were queued by php artisan serve.
     */
    public function getAllDashboardData()
    {
        // ── Stats ──────────────────────────────────────────────
        $totalAthletes      = Athlete::where('is_deleted', false)->count();
        $totalCoaches       = Coach::where('is_deleted', false)->count();
        $totalEvents        = Event::where('is_deleted', false)->count();
        $totalRecords       = Record::where('is_deleted', false)->count();
        $activeSports       = Sport::where('is_deleted', false)->count();

        $upcomingEventsCount = Event::where('is_deleted', false)
            ->where('status', 'Upcoming')
            ->where('event_date', '>=', now())
            ->count();

        $eligibleAthletes   = Athlete::where('is_deleted', false)->where('academic_status', 'Eligible')->count();
        $ineligibleAthletes = Athlete::where('is_deleted', false)->where('academic_status', 'Ineligible')->count();
        $activeAthletes     = Athlete::where('is_deleted', false)->where('athlete_status', 'active')->count();
        $inactiveAthletes   = Athlete::where('is_deleted', false)->where('athlete_status', 'inactive')->count();

        // ── Upcoming Events ────────────────────────────────────
        $events = Event::where('is_deleted', false)
            ->where('status', 'Upcoming')
            ->where('event_date', '>=', now())
            ->orderBy('event_date', 'asc')
            ->limit(10)
            ->get();

        // ── Recent Records ─────────────────────────────────────
        $records = Record::where('is_deleted', false)
            ->orderBy('event_date', 'desc')
            ->limit(10)
            ->get();

        // ── Athlete Retention (single query) ───────────────────
        $currentYear = now()->year;
        $startYear   = $currentYear - 4;

        $rows = Athlete::where('is_deleted', false)
            ->where('created_at', '<=', now()->endOfYear())
            ->selectRaw("
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y0,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y1,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y2,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y3,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y4
            ", [
                $startYear,
                $startYear + 1,
                $startYear + 2,
                $startYear + 3,
                $currentYear,
            ])
            ->first();

        $retention = [];
        foreach (range(0, 4) as $i) {
            $key = "y{$i}";
            $retention[] = [
                'year'  => (string)($startYear + $i),
                'total' => (int)($rows->$key ?? 0),
            ];
        }

        // ── Sport Participation ────────────────────────────────
        $participation = Athlete::where('is_deleted', false)
            ->select('sport', DB::raw('count(*) as count'))
            ->groupBy('sport')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json([
            'stats' => [
                'total_athletes'      => $totalAthletes,
                'total_coaches'       => $totalCoaches,
                'total_events'        => $totalEvents,
                'total_records'       => $totalRecords,
                'upcoming_events'     => $upcomingEventsCount,
                'active_sports'       => $activeSports,
                'eligible_athletes'   => $eligibleAthletes,
                'ineligible_athletes' => $ineligibleAthletes,
                'active_athletes'     => $activeAthletes,
                'inactive_athletes'   => $inactiveAthletes,
            ],
            'events'        => $events,
            'records'       => $records,
            'retention'     => $retention,
            'participation' => $participation,
        ], 200);
    }

    public function getStats()
    {
        $totalAthletes      = Athlete::where('is_deleted', false)->count();
        $totalCoaches       = Coach::where('is_deleted', false)->count();
        $totalEvents        = Event::where('is_deleted', false)->count();
        $totalRecords       = Record::where('is_deleted', false)->count();
        $activeSports       = Sport::where('is_deleted', false)->count();

        $upcomingEvents = Event::where('is_deleted', false)
            ->where('status', 'Upcoming')
            ->where('event_date', '>=', now())
            ->count();

        $eligibleAthletes   = Athlete::where('is_deleted', false)->where('academic_status', 'Eligible')->count();
        $ineligibleAthletes = Athlete::where('is_deleted', false)->where('academic_status', 'Ineligible')->count();
        $activeAthletes     = Athlete::where('is_deleted', false)->where('athlete_status', 'active')->count();
        $inactiveAthletes   = Athlete::where('is_deleted', false)->where('athlete_status', 'inactive')->count();

        return response()->json([
            'stats' => [
                'total_athletes'      => $totalAthletes,
                'total_coaches'       => $totalCoaches,
                'total_events'        => $totalEvents,
                'total_records'       => $totalRecords,
                'upcoming_events'     => $upcomingEvents,
                'active_sports'       => $activeSports,
                'eligible_athletes'   => $eligibleAthletes,
                'ineligible_athletes' => $ineligibleAthletes,
                'active_athletes'     => $activeAthletes,
                'inactive_athletes'   => $inactiveAthletes,
            ]
        ], 200);
    }

    public function getUpcomingEvents()
    {
        $events = Event::where('is_deleted', false)
            ->where('status', 'Upcoming')
            ->where('event_date', '>=', now())
            ->orderBy('event_date', 'asc')
            ->limit(10)
            ->get();

        return response()->json(['events' => $events], 200);
    }

    public function getRecentRecords()
    {
        $records = Record::where('is_deleted', false)
            ->orderBy('event_date', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['records' => $records], 200);
    }

    public function getAthleteRetention()
    {
        $currentYear = now()->year;
        $startYear   = $currentYear - 4;

        $rows = Athlete::where('is_deleted', false)
            ->where('created_at', '<=', now()->endOfYear())
            ->selectRaw("
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y0,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y1,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y2,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y3,
                SUM(CASE WHEN YEAR(created_at) <= ? THEN 1 ELSE 0 END) AS y4
            ", [
                $startYear,
                $startYear + 1,
                $startYear + 2,
                $startYear + 3,
                $currentYear,
            ])
            ->first();

        $retention = [];
        foreach (range(0, 4) as $i) {
            $key = "y{$i}";
            $retention[] = [
                'year'  => (string)($startYear + $i),
                'total' => (int)($rows->$key ?? 0),
            ];
        }

        return response()->json(['retention' => $retention], 200);
    }

    public function getSportParticipation()
    {
        $participation = Athlete::where('is_deleted', false)
            ->select('sport', DB::raw('count(*) as count'))
            ->groupBy('sport')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json(['participation' => $participation], 200);
    }

    public function searchAthletes(Request $request)
    {
        $query = trim($request->input('query', ''));

        if ($query === '') {
            return response()->json(['results' => []], 200);
        }

        $athletes = Athlete::where('is_deleted', false)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%")
                  ->orWhere('school_id', 'LIKE', "%{$query}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$query}%");
            })
            ->with('gender')
            ->limit(20)
            ->get();

        return response()->json(['results' => $athletes], 200);
    }

    public function searchCoaches(Request $request)
    {
        $query = trim($request->input('query', ''));

        if ($query === '') {
            return response()->json(['results' => []], 200);
        }

        $coaches = Coach::where('is_deleted', false)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%")
                  ->orWhere('staff_id', 'LIKE', "%{$query}%")
                  ->orWhere(DB::raw("CONCAT(first_name, ' ', last_name)"), 'LIKE', "%{$query}%");
            })
            ->limit(20)
            ->get();

        return response()->json(['results' => $coaches], 200);
    }
}
