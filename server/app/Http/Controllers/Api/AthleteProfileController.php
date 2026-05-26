<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\AthleteDocument;
use App\Models\MedicalRecord;
use App\Models\PracticeSchedule;
use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AthleteProfileController extends Controller
{
    /**
     * Single endpoint that returns all athlete dashboard data in one request.
     * Replaces 3 separate calls that were queued by php artisan serve.
     */
    public function getAllDashboardData(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::with(['user', 'gender', 'coach'])
            ->where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        // ── Practice Schedules ─────────────────────────────────
        $practiceSchedules = PracticeSchedule::with(['coach'])
            ->where('coach_id', $athlete->coach_id)
            ->where('is_deleted', 0)
            ->orderBy('practice_date', 'asc')
            ->get();

        // ── Performance Records ────────────────────────────────
        $records = Record::where('athlete_id', $athlete->athlete_id)
            ->orderBy('created_at', 'desc')
            ->get();

        // ── Medical Documents ──────────────────────────────────
        $medicalTypes = [
            'Medical Record',
            'Physical Exam',
            'Injury Report',
            'Medical Clearance',
        ];

        $documents = AthleteDocument::where('athlete_id', $athlete->athlete_id)
            ->whereIn('document_type', $medicalTypes)
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'athlete'            => $athlete,
            'practice_schedules' => $practiceSchedules,
            'records'            => $records,
            'documents'          => $documents,
        ], 200);
    }

    public function getMyProfile(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::with(['user', 'gender', 'coach'])
            ->where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        return response()->json(['athlete' => $athlete], 200);
    }

    public function getMyMedicalRecords(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        $medicalRecords = MedicalRecord::where('athlete_id', $athlete->athlete_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['medical_records' => $medicalRecords], 200);
    }

    public function getMyPracticeSchedules(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        $practiceSchedules = PracticeSchedule::with(['coach'])
            ->where('coach_id', $athlete->coach_id)
            ->where('is_deleted', 0)
            ->orderBy('practice_date', 'asc')
            ->get();

        return response()->json(['practice_schedules' => $practiceSchedules], 200);
    }

    public function getMyRecords(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        $records = Record::where('athlete_id', $athlete->athlete_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['records' => $records], 200);
    }

    public function updateMyProfile(Request $request)
    {
        $user = Auth::user();

        $athlete = Athlete::where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        $validated = $request->validate([
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
        ]);

        $athlete->update($validated);

        if ($athlete->user) {
            $athlete->user->update($validated);
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'athlete' => $athlete->fresh(['user', 'gender', 'coach'])
        ], 200);
    }
}
