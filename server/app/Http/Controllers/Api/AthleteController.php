<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AthleteController extends Controller
{
    public function loadAthletes(Request $request)
    {
        $user = Auth::user();

        $query = Athlete::with(['user', 'gender', 'coach'])
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc');

        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $query->where('coach_id', $coach->coach_id);
            }
        }

        if ($request->has('sport') && !empty($request->sport)) {
            $query->where('sport', $request->sport);
        }

        $athletes = $query->get();

        return response()->json([
            'athletes' => $athletes
        ], 200);
    }

    public function getAthlete($athleteId)
    {
        $athlete = Athlete::with(['user', 'gender', 'coach'])
            ->where('athlete_id', $athleteId)
            ->where('is_deleted', 0)
            ->firstOrFail();

        return response()->json([
            'athlete' => $athlete
        ], 200);
    }

    public function getMyStatus(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'Athlete') {
            return response()->json([
                'message' => 'This endpoint is only for athletes.'
            ], 403);
        }

        $athlete = Athlete::where('user_id', $user->user_id)
            ->where('is_deleted', 0)
            ->with(['coach', 'gender'])
            ->first();

        if (!$athlete) {
            return response()->json([
                'message' => 'Athlete profile not found.'
            ], 404);
        }

        $needsWarning = false;
        $warningMessage = '';
        $warningType = '';

        if ($athlete->athlete_status === 'inactive') {
            $needsWarning = true;
            $warningType = 'inactive_status';

            if ($athlete->consecutive_absences >= 3) {
                $warningMessage = "Your account has been marked as INACTIVE due to {$athlete->consecutive_absences} consecutive absences. Please contact your coach to resolve this issue.";
            } else {
                $warningMessage = "Your account has been marked as INACTIVE. Please contact your coach for more information.";
            }
        } elseif ($athlete->consecutive_absences >= 2 && $athlete->consecutive_absences < 3) {
            $needsWarning = true;
            $warningType = 'approaching_inactive';
            $warningMessage = "Warning: You have {$athlete->consecutive_absences} consecutive absences. One more absence will result in your account being marked as INACTIVE.";
        }

        return response()->json([
            'athlete' => $athlete,
            'needs_warning' => $needsWarning,
            'warning_type' => $warningType,
            'warning_message' => $warningMessage,
            'consecutive_absences' => $athlete->consecutive_absences,
            'athlete_status' => $athlete->athlete_status
        ], 200);
    }

    public function storeAthlete(Request $request)
    {
        $validated = $request->validate([
            'school_id' => [
                'required',
                'max:55',
                Rule::unique('tbl_athletes', 'school_id')
                    ->where(fn($query) => $query->where('is_deleted', 0)),
            ],
            'email'       => ['nullable', 'email', 'max:100'],
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
            'gender'      => ['required', 'exists:tbl_genders,gender_id'],
            'birth_date'  => ['required', 'date'],
            'sport'       => ['required', 'max:55'],
            'position'    => ['required', 'max:55'],
            'department'  => ['required', 'max:55'],
            'coach_id'    => ['required', 'exists:tbl_coaches,coach_id']
        ]);

        $birthDate = new \DateTime($validated['birth_date']);
        $today     = new \DateTime('today');
        $age       = $birthDate->diff($today)->y;

        // Only reuse an existing user account if it belongs to an Athlete role.
        // If the matching user is an Admin or Coach, always create a new separate
        // Athlete account to avoid linking unrelated roles together.
        $existingUser = User::where('first_name', $validated['first_name'])
            ->where('last_name', $validated['last_name'])
            ->where('birth_date', $validated['birth_date'])
            ->where('role', 'Athlete')
            ->where('is_deleted', 0)
            ->first();

        $credentials = null;
        $userId      = null;

        if (!$existingUser) {
            $username = $validated['school_id'];
            $password = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $newUser = User::create([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name'   => $validated['last_name'],
                'suffix_name' => $validated['suffix_name'],
                'gender_id'   => $validated['gender'],
                'birth_date'  => $validated['birth_date'],
                'age'         => $age,
                'username'    => $username,
                'password'    => Hash::make($password),
                'role'        => 'Athlete',
                'is_deleted'  => 0
            ]);

            $userId = $newUser->user_id;

            $credentials = [
                'username' => $username,
                'password' => $password,
                'role'     => 'Athlete'
            ];
        } else {
            $userId = $existingUser->user_id;
        }

        $athlete = Athlete::create([
            'user_id'                => $userId,
            'coach_id'               => $validated['coach_id'],
            'school_id'              => $validated['school_id'],
            'email'                  => $validated['email'] ?? null,
            'first_name'             => $validated['first_name'],
            'middle_name'            => $validated['middle_name'],
            'last_name'              => $validated['last_name'],
            'suffix_name'            => $validated['suffix_name'],
            'gender_id'              => $validated['gender'],
            'birth_date'             => $validated['birth_date'],
            'age'                    => $age,
            'sport'                  => $validated['sport'],
            'position'               => $validated['position'],
            'department'             => $validated['department'],
            'academic_status'        => 'Pending Grade Upload',
            'attendance_percentage'  => 0.00,
        ]);

        return response()->json([
            'message'     => 'Athlete Successfully Saved.',
            'athlete'     => $athlete->load(['user', 'gender', 'coach']),
            'credentials' => $credentials
        ], 200);
    }

    public function updateAthlete(Request $request, Athlete $athlete)
    {
        $user = Auth::user();

        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach && $athlete->coach_id !== $coach->coach_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only update your own athletes.'
                ], 403);
            }
        }

        $validated = $request->validate([
            'school_id' => [
                'required',
                'max:55',
                Rule::unique('tbl_athletes', 'school_id')
                    ->ignore($athlete->athlete_id, 'athlete_id')
                    ->where(fn($query) => $query->where('is_deleted', 0)),
            ],
            'email'       => ['nullable', 'email', 'max:100'],
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
            'gender'      => ['required', 'exists:tbl_genders,gender_id'],
            'birth_date'  => ['required', 'date'],
            'sport'       => ['required', 'max:55'],
            'position'    => ['required', 'max:55'],
            'department'  => ['required', 'max:55'],
            'coach_id'    => ['required', 'exists:tbl_coaches,coach_id']
        ]);

        $birthDate = new \DateTime($validated['birth_date']);
        $today     = new \DateTime('today');
        $age       = $birthDate->diff($today)->y;

        $athlete->update([
            'school_id'   => $validated['school_id'],
            'email'       => $validated['email'] ?? null,
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name'   => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'gender_id'   => $validated['gender'],
            'birth_date'  => $validated['birth_date'],
            'age'         => $age,
            'sport'       => $validated['sport'],
            'position'    => $validated['position'],
            'department'  => $validated['department'],
            'coach_id'    => $validated['coach_id']
        ]);

        // Only sync the linked user account if it is strictly an Athlete account.
        // Never overwrite an Admin or Coach user account even if user_id is linked.
        if ($athlete->user_id && $athlete->user && $athlete->user->role === 'Athlete') {
            $athlete->user->update([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name'   => $validated['last_name'],
                'suffix_name' => $validated['suffix_name'],
                'gender_id'   => $validated['gender'],
                'birth_date'  => $validated['birth_date'],
                'age'         => $age,
                'username'    => $validated['school_id']
            ]);
        }

        return response()->json([
            'message' => 'Athlete Successfully Updated.',
            'athlete' => $athlete->fresh(['user', 'gender', 'coach'])
        ], 200);
    }

    public function destroyAthlete(Athlete $athlete)
    {
        $user = Auth::user();

        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach && $athlete->coach_id !== $coach->coach_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only delete your own athletes.'
                ], 403);
            }
        }

        $athlete->update(['is_deleted' => 1]);

        // Only soft-delete the linked user account if it is strictly an Athlete account.
        // Never cascade-delete an Admin or Coach user even if their user_id was linked.
        if ($athlete->user_id && $athlete->user && $athlete->user->role === 'Athlete') {
            $athlete->user->update(['is_deleted' => 1]);
        }

        return response()->json([
            'message' => 'Athlete Successfully Deleted.'
        ], 200);
    }

    public function toggleAthleteStatus(Request $request, Athlete $athlete)
    {
        $user = Auth::user();

        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach && $athlete->coach_id !== $coach->coach_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only manage your own athletes.'
                ], 403);
            }
        }

        $newStatus = $athlete->athlete_status === 'active' ? 'inactive' : 'active';

        $athlete->update([
            'athlete_status'      => $newStatus,
            'inactive_since'      => $newStatus === 'inactive' ? now() : null,
            'status_changed_by'   => $user->user_id,
            'consecutive_absences' => $newStatus === 'active' ? 0 : $athlete->consecutive_absences
        ]);

        return response()->json([
            'message' => "Athlete status changed to {$newStatus}.",
            'athlete' => $athlete->fresh(['user', 'gender', 'coach', 'statusChanger'])
        ], 200);
    }
}
