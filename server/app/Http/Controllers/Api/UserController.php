<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Coach;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function loadUsers()
    {
        $users = User::with(['gender'])
            ->where('tbl_users.is_deleted', false)
            ->get();

        return response()->json([
            'users' => $users
        ], 200);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'first_name'           => ['required', 'max:55'],
            'middle_name'          => ['nullable', 'max:55'],
            'last_name'            => ['required', 'max:55'],
            'suffix_name'          => ['nullable', 'max:55'],
            'gender'               => ['required'],
            'birth_date'           => ['required', 'date'],
            'username'             => [
                'required',
                'min:6',
                'max:12',
                Rule::unique('tbl_users', 'username')
                    ->where(fn($query) => $query->where('is_deleted', 0)),
            ],
            'role'                 => ['required', 'in:Admin'],
            'password'             => ['required', 'min:6', 'max:12', 'confirmed'],
            'password_confirmation' => ['required', 'min:6', 'max:12']
        ]);

        $age = date_diff(date_create($validated['birth_date']), date_create('now'))->y;

        User::create([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name'   => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'gender_id'   => $validated['gender'],
            'birth_date'  => $validated['birth_date'],
            'age'         => $age,
            'username'    => $validated['username'],
            'role'        => $validated['role'],
            'password'    => Hash::make($validated['password']),
            'is_deleted'  => false
        ]);

        return response()->json([
            'message' => 'Admin User Successfully Created.'
        ], 200);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
            'gender'      => ['required'],
            'birth_date'  => ['required', 'date'],
            'username'    => [
                'required',
                'min:6',
                'max:12',
                Rule::unique('tbl_users', 'username')
                    ->ignore($user)
                    ->where(fn($query) => $query->where('is_deleted', 0)),
            ],
            'role'        => ['required', 'in:Admin,Coach,Athlete']
        ]);

        $age = date_diff(date_create($validated['birth_date']), date_create('now'))->y;

        $usernameChanged = $user->username !== $validated['username'];

        $user->update([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'],
            'last_name'   => $validated['last_name'],
            'suffix_name' => $validated['suffix_name'],
            'gender_id'   => $validated['gender'],
            'birth_date'  => $validated['birth_date'],
            'age'         => $age,
            'username'    => $validated['username'],
            'role'        => $validated['role']
        ]);

        if ($usernameChanged) {
            if ($user->role === 'Athlete') {
                $athlete = Athlete::where('user_id', $user->user_id)->first();
                if ($athlete) {
                    $athlete->update(['school_id' => $validated['username']]);
                }
            }

            if ($user->role === 'Coach') {
                $coach = Coach::where('user_id', $user->user_id)->first();
                if ($coach) {
                    $coach->update(['staff_id' => $validated['username']]);
                }
            }
        }

        return response()->json([
            'message' => 'User Successfully Updated.',
            'user'    => $user
        ], 200);
    }

    public function destroyUser(User $user)
    {
        $user->update(['is_deleted' => 1]);

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)
                ->where('is_deleted', 0)
                ->first();
            if ($coach) {
                $coach->update(['is_deleted' => 1]);
            }
        }

        if ($user->role === 'Athlete') {
            $athlete = Athlete::where('user_id', $user->user_id)
                ->where('is_deleted', 0)
                ->first();
            if ($athlete) {
                $athlete->update(['is_deleted' => 1]);
            }
        }

        return response()->json([
            'message' => 'User Successfully Deleted.'
        ], 200);
    }

    public function resetPassword(User $user)
    {
        $newPassword = $this->generateSixDigitPassword();

        $user->update([
            'password' => Hash::make($newPassword)
        ]);

        return response()->json([
            'message'     => 'Password reset successfully.',
            'credentials' => [
                'username' => $user->username,
                'password' => $newPassword,
                'role'     => $user->role
            ]
        ], 200);
    }

    private function generateSixDigitPassword()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
