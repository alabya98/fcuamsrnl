<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sport;
use Illuminate\Http\Request;

class SportController extends Controller
{
    public function loadSports()
    {
        $sports = Sport::where('tbl_sports.is_deleted', false)
            ->get();

        return response()->json([
            'sports' => $sports
        ], 200);
    }

    public function storeSport(Request $request)
    {
        $validated = $request->validate([
            'sport' => ['required', 'min:3', 'max:55']
        ]);

        Sport::create([
            'sport' => $validated['sport']
        ]);

        return response()->json([
            'message' => 'Sport successfully saved.'
        ], 200);
    }

    public function getSport($sportId)
    {
        $sport = Sport::find($sportId);

        return response()->json([
            'sport' => $sport
        ], 200);
    }

    public function updateSport(Request $request, Sport $sport)
    {
        $validated = $request->validate([
            'sport' => ['required', 'min:3', 'max:55']
        ]);

        $sport->update([
            'sport' => $validated['sport']
        ]);

        return response()->json([
            'sport' => $sport,
            'message' => 'Sport Successfully Updated.'
        ], 200);
    }

    public function destroySport(Sport $sport)
    {
        $sport->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'Sport Successfully Deleted.'
        ], 200);
    }
}
