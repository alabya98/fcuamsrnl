<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coach;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class CoachController extends Controller
{
    public function loadCoaches(Request $request)
    {
        $query = Coach::with(['user', 'gender'])
            ->withCount('athletes')
            ->where('tbl_coaches.is_deleted', false);

        if ($request->has('sport') && !empty($request->sport)) {
            $query->where('sports_coached', $request->sport);
        }

        $coaches = $query->get();

        return response()->json([
            'coaches' => $coaches
        ], 200);
    }

    public function storeCoach(Request $request)
    {
        $validated = $request->validate([
            'first_name'     => ['required', 'max:55'],
            'middle_name'    => ['nullable', 'max:55'],
            'last_name'      => ['required', 'max:55'],
            'suffix_name'    => ['nullable', 'max:55'],
            'position'       => ['required', 'max:55'],
            'sports_coached' => ['required', 'max:55'],
            'contact_email'  => ['required', 'email', 'max:255'],
            'gender_id'      => ['required', 'exists:tbl_genders,gender_id'],
            'birth_date'     => ['required', 'date'],
        ]);

        do {
            $randomNumber = str_pad(random_int(1, 999), 3, '0', STR_PAD_LEFT);
            $staffId = 'COACH-' . $randomNumber;
        } while (Coach::where('staff_id', $staffId)->where('is_deleted', 0)->exists());

        $birthDate = new \DateTime($validated['birth_date']);
        $today = new \DateTime();
        $age = $today->diff($birthDate)->y;

        $existingUser = User::where('first_name', $validated['first_name'])
            ->where('last_name', $validated['last_name'])
            ->where('birth_date', $validated['birth_date'])
            ->where('is_deleted', 0)
            ->first();

        $credentials = null;
        $userId = null;

        if (!$existingUser) {
            $username = $staffId;
            $password = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $newUser = User::create([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name'   => $validated['last_name'],
                'suffix_name' => $validated['suffix_name'],
                'gender_id'   => $validated['gender_id'],
                'birth_date'  => $validated['birth_date'],
                'age'         => $age,
                'username'    => $username,
                'password'    => Hash::make($password),
                'role'        => 'Coach',
                'is_deleted'  => 0
            ]);

            $userId = $newUser->user_id;

            $credentials = [
                'username' => $username,
                'password' => $password,
                'role'     => 'Coach'
            ];
        } else {
            $userId = $existingUser->user_id;
        }

        $coach = Coach::create([
            'user_id'        => $userId,
            'staff_id'       => $staffId,
            'first_name'     => $validated['first_name'],
            'middle_name'    => $validated['middle_name'],
            'last_name'      => $validated['last_name'],
            'suffix_name'    => $validated['suffix_name'],
            'position'       => $validated['position'],
            'sports_coached' => $validated['sports_coached'],
            'contact_email'  => $validated['contact_email'],
            'gender_id'      => $validated['gender_id'],
            'birth_date'     => $validated['birth_date'],
        ]);

        return response()->json([
            'message'     => 'Coach Successfully Saved.',
            'coach'       => $coach->load(['user', 'gender']),
            'credentials' => $credentials
        ], 200);
    }

    public function updateCoach(Request $request, Coach $coach)
    {
        $validated = $request->validate([
            'staff_id' => [
                'required',
                'max:55',
                Rule::unique('tbl_coaches', 'staff_id')
                    ->ignore($coach->coach_id, 'coach_id')
                    ->where(fn($query) => $query->where('is_deleted', 0)),
            ],
            'first_name'     => ['required', 'max:55'],
            'middle_name'    => ['nullable', 'max:55'],
            'last_name'      => ['required', 'max:55'],
            'suffix_name'    => ['nullable', 'max:55'],
            'position'       => ['required', 'max:55'],
            'sports_coached' => ['required', 'max:55'],
            'contact_email'  => ['required', 'email', 'max:255'],
            'gender_id'      => ['required', 'exists:tbl_genders,gender_id'],
            'birth_date'     => ['required', 'date'],
        ]);

        $birthDate = new \DateTime($validated['birth_date']);
        $today = new \DateTime();
        $age = $today->diff($birthDate)->y;

        $coach->update([
            'staff_id'       => $validated['staff_id'],
            'first_name'     => $validated['first_name'],
            'middle_name'    => $validated['middle_name'],
            'last_name'      => $validated['last_name'],
            'suffix_name'    => $validated['suffix_name'],
            'position'       => $validated['position'],
            'sports_coached' => $validated['sports_coached'],
            'contact_email'  => $validated['contact_email'],
            'gender_id'      => $validated['gender_id'],
            'birth_date'     => $validated['birth_date'],
        ]);

        if ($coach->user_id && $coach->user) {
            $coach->user->update([
                'first_name'  => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'last_name'   => $validated['last_name'],
                'suffix_name' => $validated['suffix_name'],
                'gender_id'   => $validated['gender_id'],
                'birth_date'  => $validated['birth_date'],
                'age'         => $age,
                'username'    => $validated['staff_id']
            ]);
        }

        return response()->json([
            'message' => 'Coach Successfully Updated.',
            'coach'   => $coach->load(['user', 'gender'])
        ], 200);
    }

    public function destroyCoach(Coach $coach)
    {
        $coach->update(['is_deleted' => 1]);

        if ($coach->user_id && $coach->user) {
            $coach->user->update(['is_deleted' => 1]);
        }

        return response()->json([
            'message' => 'Coach Successfully Deleted.'
        ], 200);
    }

    public function linkUserAccount(Request $request, Coach $coach)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:tbl_users,user_id']
        ]);

        $coach->update(['user_id' => $validated['user_id']]);

        return response()->json([
            'message' => 'User account linked successfully.',
            'coach'   => $coach->load(['user', 'gender'])
        ], 200);
    }

    public function unlinkUserAccount(Coach $coach)
    {
        $coach->update(['user_id' => null]);

        return response()->json([
            'message' => 'User account unlinked successfully.'
        ], 200);
    }

    public function getCoachAthletes($coachId)
    {
        try {
            $coach = Coach::where('coach_id', $coachId)
                ->where('is_deleted', false)
                ->with(['user', 'gender'])
                ->firstOrFail();

            $athletes = \App\Models\Athlete::where('coach_id', $coachId)
                ->where('is_deleted', false)
                // ✅ FIX: Added 'user' to the eager load so that
                //    athlete.user.profile_picture_url is available in the
                //    frontend — it was previously missing, causing the modal
                //    to always fall back to initials even when a photo existed.
                ->with(['gender', 'coach', 'user'])
                ->orderBy('last_name', 'asc')
                ->orderBy('first_name', 'asc')
                ->get();

            return response()->json([
                'message'        => 'Athletes retrieved successfully',
                'athletes'       => $athletes,
                'coach'          => $coach,
                'total_athletes' => $athletes->count()
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Coach not found',
                'error'   => 'The specified coach does not exist'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving athletes',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
