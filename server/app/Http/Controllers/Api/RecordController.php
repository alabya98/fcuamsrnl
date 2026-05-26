<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Record;
use App\Models\Coach;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecordController extends Controller
{
    public function loadRecords()
    {
        $user  = Auth::user();
        $query = Record::with(['creator', 'athlete'])
            ->where('tbl_records.is_deleted', false)
            ->orderBy('event_date', 'desc');

        if ($user->role === 'Admin') {
            $records = $query->get();

        } elseif ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();

            if ($coach) {
                $records = $query->where('sport', $coach->sports_coached)->get();
            } else {
                $records = collect();
            }

        } elseif ($user->role === 'Athlete') {
            $athleteProfile = Athlete::where('user_id', $user->user_id)->first();

            if ($athleteProfile) {
                $records = $query->where('athlete_id', $athleteProfile->athlete_id)->get();
            } else {
                $records = collect();
            }

        } else {
            $records = collect();
        }

        return response()->json([
            'records' => $records
        ], 200);
    }

    public function storeRecord(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot create records.'
            ], 403);
        }

        $validated = $request->validate([
            'athlete_id'        => ['nullable', 'integer', 'exists:tbl_athletes,athlete_id'],
            'event_name'        => ['required', 'max:255'],
            'competition_level' => ['required', 'max:100'],
            'sport'             => ['required', 'max:100'],
            'event_date'        => ['required', 'date'],
            'venue'             => ['required', 'max:255'],
            'achievement'       => ['required', 'max:100'],
            'athlete_name'      => ['required', 'max:255'],
            'coach_name'        => ['nullable', 'max:255'],
            'category'          => ['required', 'in:Team,Individual'],
            'record_type'       => ['required', 'max:100'],
            'points_score'      => ['nullable', 'max:100'],
            'remarks'           => ['nullable']
        ]);

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();

            if (!$coach) {
                return response()->json([
                    'message' => 'Coach profile not found'
                ], 404);
            }

            if ($validated['sport'] !== $coach->sports_coached) {
                return response()->json([
                    'message' => 'You can only add records for your sport: ' . $coach->sports_coached
                ], 403);
            }
        }

        $year = date('Y', strtotime($validated['event_date']));

        $record = Record::create([
            'created_by'        => $user->user_id,
            'creator_role'      => $user->role,
            'athlete_id'        => $validated['athlete_id'] ?? null,
            'event_name'        => $validated['event_name'],
            'competition_level' => $validated['competition_level'],
            'sport'             => $validated['sport'],
            'event_date'        => $validated['event_date'],
            'venue'             => $validated['venue'],
            'achievement'       => $validated['achievement'],
            'athlete_name'      => $validated['athlete_name'],
            'coach_name'        => $validated['coach_name'] ?? null,
            'category'          => $validated['category'],
            'record_type'       => $validated['record_type'],
            'points_score'      => $validated['points_score'] ?? null,
            'remarks'           => $validated['remarks'] ?? null,
            'year'              => $year
        ]);

        return response()->json([
            'message' => 'Record Successfully Saved.',
            'record'  => $record->load('creator', 'athlete')
        ], 200);
    }

    public function updateRecord(Request $request, Record $record)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot edit records.'
            ], 403);
        }

        if ($user->role === 'Coach' && $record->created_by !== $user->user_id) {
            return response()->json([
                'message' => 'Unauthorized. You can only edit records you created.'
            ], 403);
        }

        $validated = $request->validate([
            'athlete_id'        => ['nullable', 'integer', 'exists:tbl_athletes,athlete_id'],
            'event_name'        => ['required', 'max:255'],
            'competition_level' => ['required', 'max:100'],
            'sport'             => ['required', 'max:100'],
            'event_date'        => ['required', 'date'],
            'venue'             => ['required', 'max:255'],
            'achievement'       => ['required', 'max:100'],
            'athlete_name'      => ['required', 'max:255'],
            'coach_name'        => ['nullable', 'max:255'],
            'category'          => ['required', 'in:Team,Individual'],
            'record_type'       => ['required', 'max:100'],
            'points_score'      => ['nullable', 'max:100'],
            'remarks'           => ['nullable']
        ]);

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();

            if ($coach && $validated['sport'] !== $coach->sports_coached) {
                return response()->json([
                    'message' => 'You can only edit records for your sport: ' . $coach->sports_coached
                ], 403);
            }
        }

        $year = date('Y', strtotime($validated['event_date']));

        $record->update([
            'athlete_id'        => $validated['athlete_id'] ?? $record->athlete_id,
            'event_name'        => $validated['event_name'],
            'competition_level' => $validated['competition_level'],
            'sport'             => $validated['sport'],
            'event_date'        => $validated['event_date'],
            'venue'             => $validated['venue'],
            'achievement'       => $validated['achievement'],
            'athlete_name'      => $validated['athlete_name'],
            'coach_name'        => $validated['coach_name'] ?? null,
            'category'          => $validated['category'],
            'record_type'       => $validated['record_type'],
            'points_score'      => $validated['points_score'] ?? null,
            'remarks'           => $validated['remarks'] ?? null,
            'year'              => $year
        ]);

        return response()->json([
            'message' => 'Record Successfully Updated.',
            'record'  => $record->load('creator', 'athlete')
        ], 200);
    }

    public function destroyRecord(Record $record)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot delete records.'
            ], 403);
        }

        if ($user->role === 'Coach' && $record->created_by !== $user->user_id) {
            return response()->json([
                'message' => 'Unauthorized. You can only delete records you created.'
            ], 403);
        }

        $record->update(['is_deleted' => true]);

        return response()->json([
            'message' => 'Record Successfully Deleted.'
        ], 200);
    }
}
