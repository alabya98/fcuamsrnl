<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Build a clean absolute URL for a stored profile picture path.
     * Handles both legacy "public/profile_pictures/..." paths and
     * new "profile_pictures/..." paths correctly.
     */
    private function buildProfilePictureUrl(?string $path): ?string
    {
        if (!$path) return null;
        // Strip legacy "public/" prefix if present
        $cleanPath = preg_replace('#^public/#', '', $path);
        // asset('storage/...') produces http://127.0.0.1:8000/storage/...
        return asset('storage/' . $cleanPath);
    }

    /**
     * Helper: build the user array returned in all responses.
     */
    private function userArray(User $user): array
    {
        return [
            'user_id'             => $user->user_id,
            'first_name'          => $user->first_name,
            'middle_name'         => $user->middle_name,
            'last_name'           => $user->last_name,
            'suffix_name'         => $user->suffix_name,
            'username'            => $user->username,
            'role'                => $user->role,
            'gender'              => $user->gender,
            'birth_date'          => $user->birth_date,
            'age'                 => $user->age,
            'profile_picture_url' => $this->buildProfilePictureUrl($user->profile_picture),
        ];
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('username', $validated['username'])
            ->where('is_deleted', false || 0)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // ── Athlete-specific login restriction ────────────────────────────
        if ($user->role === 'Athlete') {
            $athlete = Athlete::where('user_id', $user->user_id)
                ->where('is_deleted', 0)
                ->first();

            if ($athlete && $athlete->athlete_status === 'inactive') {
                if ($athlete->consecutive_absences < 3) {
                    throw ValidationException::withMessages([
                        'username' => ['Your account has been deactivated. Please contact your coach for more information.'],
                    ]);
                }
            }
        }
        // ─────────────────────────────────────────────────────────────────

        $user->load('gender');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $this->userArray($user),
            'token'   => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ], 200);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('gender');

        return response()->json([
            'user' => $this->userArray($user),
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name'  => ['required', 'max:55'],
            'middle_name' => ['nullable', 'max:55'],
            'last_name'   => ['required', 'max:55'],
            'suffix_name' => ['nullable', 'max:55'],
        ]);

        $user->update($validated);
        $user->load('gender');

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $this->userArray($user),
        ], 200);
    }

    public function updateUsername(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'new_username' => [
                'required',
                'min:6',
                'max:12',
                Rule::unique('tbl_users', 'username')->ignore($user->user_id, 'user_id'),
            ],
            'current_password' => ['required'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['username' => $validated['new_username']]);

        return response()->json([
            'message' => 'Username updated successfully.',
            'user'    => ['user_id' => $user->user_id, 'username' => $user->username],
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password'          => ['required'],
            'new_password'              => ['required', 'min:6', 'max:12', 'confirmed'],
            'new_password_confirmation' => ['required'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        if (Hash::check($validated['new_password'], $user->password)) {
            throw ValidationException::withMessages([
                'new_password' => ['New password cannot be the same as current password.'],
            ]);
        }

        $user->update(['password' => Hash::make($validated['new_password'])]);

        return response()->json([
            'message' => 'Password changed successfully.',
        ], 200);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();
        $user->load('gender');

        return response()->json([
            'user' => array_merge($this->userArray($user), [
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]),
        ], 200);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048',
            ],
        ]);

        $user = $request->user();

        // Delete old picture if it exists
        if ($user->profile_picture) {
            $oldCleanPath = preg_replace('#^public/#', '', $user->profile_picture);
            if (Storage::disk('public')->exists($oldCleanPath)) {
                Storage::disk('public')->delete($oldCleanPath);
            }
        }

        // Store on the public disk
        // Saves to: storage/app/public/profile_pictures/{user_id}/filename.jpg
        // Accessible at: http://127.0.0.1:8000/storage/profile_pictures/{user_id}/filename.jpg
        $relativePath = $request->file('profile_picture')->store(
            'profile_pictures/' . $user->user_id,
            'public'
        );

        // Save WITHOUT "public/" prefix — e.g. "profile_pictures/165/filename.jpg"
        $user->update(['profile_picture' => $relativePath]);

        // Build URL using asset() — no Intelephense warnings
        $absoluteUrl = asset('storage/' . $relativePath);

        return response()->json([
            'message'             => 'Profile picture updated successfully.',
            'profile_picture_url' => $absoluteUrl,
        ], 200);
    }

    public function removeProfilePicture(Request $request)
    {
        $user = $request->user();

        if ($user->profile_picture) {
            $cleanPath = preg_replace('#^public/#', '', $user->profile_picture);
            if (Storage::disk('public')->exists($cleanPath)) {
                Storage::disk('public')->delete($cleanPath);
            }
        }

        $user->update(['profile_picture' => null]);

        return response()->json([
            'message' => 'Profile picture removed successfully.',
        ], 200);
    }
}
