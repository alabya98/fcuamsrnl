<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Coach;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function loadAnnouncements()
    {
        $user = Auth::user();
        $query = Announcement::with(['creator'])
            ->where('is_deleted', false)
            ->orderBy('publish_date', 'desc');

        // Filter based on user role
        if ($user->role === 'Admin') {
            // Admins see all announcements
            $announcements = $query->get();
        } elseif ($user->role === 'Coach') {
            // Coaches see: all admin announcements + their own announcements
            $announcements = $query->where(function ($q) use ($user) {
                $q->where('creator_role', 'Admin')
                  ->orWhere('created_by', $user->user_id);
            })->get();
        } elseif ($user->role === 'Athlete') {
            // Athletes see: admin announcements for them + coach announcements for their sport
            $athlete = Athlete::where('user_id', $user->user_id)->first();

            if ($athlete) {
                $announcements = $query->where(function ($q) use ($athlete) {
                    // Admin announcements targeted to athletes or all
                    $q->where(function ($adminQ) {
                        $adminQ->where('creator_role', 'Admin')
                               ->where(function ($targetQ) {
                                   $targetQ->where('target_audience', 'All')
                                          ->orWhere('target_audience', 'Athletes');
                               });
                    })
                    // Coach announcements for their sport
                    ->orWhere(function ($coachQ) use ($athlete) {
                        $coachQ->where('creator_role', 'Coach')
                               ->where('target_sport', $athlete->sport);
                    });
                })->get();
            } else {
                $announcements = collect();
            }
        } else {
            $announcements = collect();
        }

        return response()->json([
            'announcements' => $announcements
        ], 200);
    }

    public function storeAnnouncement(Request $request)
    {
        $user = Auth::user();

        // Validate based on role
        $validationRules = [
            'title' => ['required', 'max:255'],
            'content' => ['required'],
            'announcement_type' => ['required', 'in:General,Event,Urgent,Reminder'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'publish_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:publish_date']
        ];

        if ($user->role === 'Admin') {
            $validationRules['target_audience'] = ['required', 'in:All,Athletes,Coaches,Staff'];
        } elseif ($user->role === 'Coach') {
            // Coach can only target athletes of their sport
            $validationRules['target_audience'] = ['required', 'in:Athletes'];
        }

        $validated = $request->validate($validationRules);

        // Get coach's sport if user is a coach
        $targetSport = null;
        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach) {
                return response()->json([
                    'message' => 'Coach profile not found'
                ], 404);
            }
            $targetSport = $coach->sports_coached;
        }

        $announcement = Announcement::create([
            'created_by' => $user->user_id,
            'creator_role' => $user->role,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'announcement_type' => $validated['announcement_type'],
            'target_audience' => $validated['target_audience'],
            'target_sport' => $targetSport,
            'priority' => $validated['priority'],
            'publish_date' => $validated['publish_date'],
            'expiry_date' => $validated['expiry_date'] ?? null,
            'is_published' => true
        ]);

        return response()->json([
            'message' => 'Announcement Successfully Saved.',
            'announcement' => $announcement->load('creator')
        ], 200);
    }

    public function updateAnnouncement(Request $request, Announcement $announcement)
    {
        $user = Auth::user();

        // Check permissions
        if ($user->role === 'Coach' && $announcement->created_by !== $user->user_id) {
            return response()->json([
                'message' => 'Unauthorized. You can only edit your own announcements.'
            ], 403);
        }

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot edit announcements.'
            ], 403);
        }

        $validationRules = [
            'title' => ['required', 'max:255'],
            'content' => ['required'],
            'announcement_type' => ['required', 'in:General,Event,Urgent,Reminder'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'publish_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after_or_equal:publish_date']
        ];

        if ($user->role === 'Admin') {
            $validationRules['target_audience'] = ['required', 'in:All,Athletes,Coaches,Staff'];
        } elseif ($user->role === 'Coach') {
            $validationRules['target_audience'] = ['required', 'in:Athletes'];
        }

        $validated = $request->validate($validationRules);

        $updateData = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'announcement_type' => $validated['announcement_type'],
            'target_audience' => $validated['target_audience'],
            'priority' => $validated['priority'],
            'publish_date' => $validated['publish_date'],
            'expiry_date' => $validated['expiry_date'] ?? null
        ];

        $announcement->update($updateData);

        return response()->json([
            'message' => 'Announcement Successfully Updated.',
            'announcement' => $announcement->load('creator')
        ], 200);
    }

    public function destroyAnnouncement(Announcement $announcement)
    {
        $user = Auth::user();

        // Check permissions
        if ($user->role === 'Coach' && $announcement->created_by !== $user->user_id) {
            return response()->json([
                'message' => 'Unauthorized. You can only delete your own announcements.'
            ], 403);
        }

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot delete announcements.'
            ], 403);
        }

        $announcement->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'Announcement Successfully Deleted.'
        ], 200);
    }
}
