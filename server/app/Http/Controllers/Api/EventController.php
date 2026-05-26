<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Coach;
use App\Models\Athlete;
use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventController extends Controller
{
    private function computeStatus(string $eventDate, ?string $endDate): string
    {
        $today = Carbon::today();
        $start = Carbon::parse($eventDate);
        $end   = $endDate ? Carbon::parse($endDate) : $start->copy();

        if ($today->lt($start)) {
            return 'Upcoming';
        } elseif ($today->between($start, $end)) {
            return 'Ongoing';
        } else {
            return 'Completed';
        }
    }

    private function allowedEventTypes(): string
    {
        return 'Training,Tournament,Competition,Tryout,Meeting,Founders,CAPRISAA,Nationals,Regionals,Inter-School,Provincial,City Meet,Invitational,Other';
    }

    public function loadEvents()
    {
        $user  = Auth::user();
        $query = Event::with(['creator', 'coaches', 'athletes'])
            ->where('tbl_events.is_deleted', false)
            ->orderBy('event_date', 'asc');

        if ($user->role === 'Admin') {
            $events = $query->get();
        } elseif ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)
                ->where('is_deleted', false)
                ->first();
            if ($coach) {
                $coachSport = $coach->sports_coached;
                $events = $query->where('sport', $coachSport)->get();
            } else {
                $events = collect();
            }
        } elseif ($user->role === 'Athlete') {
            $athlete = Athlete::where('user_id', $user->user_id)
                ->where('is_deleted', false)
                ->first();
            if ($athlete) {
                $events = $query->where('sport', $athlete->sport)->get();
            } else {
                $events = collect();
            }
        } else {
            $events = collect();
        }

        $events->each(function ($event) {
            if ($event->status !== 'Cancelled') {
                $computed = $this->computeStatus(
                    $event->getRawOriginal('event_date'),
                    $event->getRawOriginal('end_date')
                );
                if ($event->status !== $computed) {
                    $event->update(['status' => $computed]);
                    $event->status = $computed;
                }
            }
        });

        return response()->json([
            'events' => $events
        ], 200);
    }

    public function getAthletesForEvent(Request $request)
    {
        $sport = $request->query('sport');
        if (!$sport) {
            return response()->json(['athletes' => []], 200);
        }

        $athletes = Athlete::where('is_deleted', false)
            ->where('sport', $sport)
            ->where(function ($query) {
                $query->where('academic_status', 'Eligible')
                    ->orWhereNull('academic_status');
            })
            ->orderBy('last_name', 'asc')
            ->get()
            ->map(function ($athlete) {
                return [
                    'athlete_id' => $athlete->athlete_id,
                    'full_name'  => trim($athlete->first_name . ' ' . ($athlete->middle_name ? $athlete->middle_name . ' ' : '') . $athlete->last_name),
                    'school_id'  => $athlete->school_id
                ];
            });

        return response()->json(['athletes' => $athletes], 200);
    }

    public function getCoachesForEvent(Request $request)
    {
        $sport = $request->query('sport');
        if (!$sport) {
            return response()->json(['coaches' => []], 200);
        }

        $coaches = Coach::where('is_deleted', false)
            ->where('sports_coached', 'LIKE', "%{$sport}%")
            ->orderBy('last_name', 'asc')
            ->get()
            ->map(function ($coach) {
                return [
                    'coach_id'  => $coach->coach_id,
                    'full_name' => trim($coach->first_name . ' ' . ($coach->middle_name ? $coach->middle_name . ' ' : '') . $coach->last_name),
                    'staff_id'  => $coach->staff_id,
                    'position'  => $coach->position
                ];
            });

        return response()->json(['coaches' => $coaches], 200);
    }

    public function storeEvent(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot create events.'
            ], 403);
        }

        $validationRules = [
            'event_name'            => ['required', 'max:255'],
            'description'           => ['nullable'],
            'event_type'            => ['required', 'in:' . $this->allowedEventTypes()],
            'sport'                 => ['required', 'max:100'],
            'event_date'            => ['required', 'date'],
            'end_date'              => ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time'            => ['required', 'date_format:H:i'],
            'end_time'              => ['required', 'date_format:H:i', 'after:start_time'],
            'venue'                 => ['required', 'max:255'],
            'organizer'             => ['nullable', 'max:255'],
            'max_participants'      => ['nullable', 'integer', 'min:1'],
            'registration_deadline' => ['nullable', 'date'],
            'notes'                 => ['nullable']
        ];

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach) {
                return response()->json(['message' => 'Coach profile not found'], 404);
            }
            $validationRules['sport'] = ['required', 'in:' . $coach->sports_coached];
        }

        $validated  = $request->validate($validationRules);
        $eventScope = ($user->role === 'Coach') ? 'Team' : 'System-wide';
        $status     = $this->computeStatus($validated['event_date'], $validated['end_date'] ?? null);

        $event = Event::create([
            'created_by'            => $user->user_id,
            'creator_role'          => $user->role,
            'event_scope'           => $eventScope,
            'event_name'            => $validated['event_name'],
            'description'           => $validated['description'] ?? null,
            'event_type'            => $validated['event_type'],
            'sport'                 => $validated['sport'],
            'event_date'            => $validated['event_date'],
            'end_date'              => $validated['end_date'] ?? null,
            'start_time'            => $validated['start_time'],
            'end_time'              => $validated['end_time'],
            'venue'                 => $validated['venue'],
            'organizer'             => $validated['organizer'] ?? null,
            'status'                => $status,
            'max_participants'      => $validated['max_participants'] ?? null,
            'registration_deadline' => $validated['registration_deadline'] ?? null,
            'notes'                 => $validated['notes'] ?? null
        ]);

        return response()->json([
            'message' => 'Event Successfully Saved.',
            'event'   => $event->load('creator', 'coaches', 'athletes')
        ], 200);
    }

    public function storeEventWithParticipants(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot create events.'
            ], 403);
        }

        $validationRules = [
            'event_name'            => ['required', 'max:255'],
            'description'           => ['nullable'],
            'event_type'            => ['required', 'in:' . $this->allowedEventTypes()],
            'sport'                 => ['required', 'max:100'],
            'event_date'            => ['required', 'date'],
            'end_date'              => ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time'            => ['required', 'date_format:H:i'],
            'end_time'              => ['required', 'date_format:H:i', 'after:start_time'],
            'venue'                 => ['required', 'max:255'],
            'organizer'             => ['nullable', 'max:255'],
            'max_participants'      => ['nullable', 'integer', 'min:1'],
            'registration_deadline' => ['nullable', 'date'],
            'notes'                 => ['nullable'],
            'participant_ids'       => ['nullable', 'array'],
            'participant_ids.*'     => ['integer', 'exists:tbl_athletes,athlete_id'],
            'coach_ids'             => ['nullable', 'array'],
            'coach_ids.*'           => ['integer', 'exists:tbl_coaches,coach_id']
        ];

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if (!$coach) {
                return response()->json(['message' => 'Coach profile not found'], 404);
            }
            $validationRules['sport'] = ['required', 'in:' . $coach->sports_coached];
        }

        $validated  = $request->validate($validationRules);
        $eventScope = ($user->role === 'Coach') ? 'Team' : 'System-wide';
        $status     = $this->computeStatus($validated['event_date'], $validated['end_date'] ?? null);

        DB::beginTransaction();
        try {
            $event = Event::create([
                'created_by'            => $user->user_id,
                'creator_role'          => $user->role,
                'event_scope'           => $eventScope,
                'event_name'            => $validated['event_name'],
                'description'           => $validated['description'] ?? null,
                'event_type'            => $validated['event_type'],
                'sport'                 => $validated['sport'],
                'event_date'            => $validated['event_date'],
                'end_date'              => $validated['end_date'] ?? null,
                'start_time'            => $validated['start_time'],
                'end_time'              => $validated['end_time'],
                'venue'                 => $validated['venue'],
                'organizer'             => $validated['organizer'] ?? null,
                'status'                => $status,
                'max_participants'      => $validated['max_participants'] ?? null,
                'registration_deadline' => $validated['registration_deadline'] ?? null,
                'notes'                 => $validated['notes'] ?? null
            ]);

            if (!empty($validated['coach_ids'])) {
                $event->coaches()->attach($validated['coach_ids']);
            }

            if (!empty($validated['participant_ids'])) {
                $event->athletes()->attach($validated['participant_ids']);

                $athletes = Athlete::whereIn('athlete_id', $validated['participant_ids'])->get();

                foreach ($athletes as $athlete) {
                    $athleteName = trim($athlete->first_name . ' ' . ($athlete->middle_name ? $athlete->middle_name . ' ' : '') . $athlete->last_name);
                    $coachName   = $athlete->coach
                        ? trim($athlete->coach->first_name . ' ' . $athlete->coach->last_name)
                        : null;

                    Record::create([
                        'created_by'        => $user->user_id,
                        'creator_role'      => $user->role,
                        'athlete_id'        => $athlete->athlete_id,
                        'event_name'        => $validated['event_name'],
                        'competition_level' => $validated['event_type'],
                        'sport'             => $validated['sport'],
                        'event_date'        => $validated['event_date'],
                        'venue'             => $validated['venue'],
                        'achievement'       => 'Participated',
                        'athlete_name'      => $athleteName,
                        'coach_name'        => $coachName,
                        'category'          => 'Individual',
                        'record_type'       => 'Participation',
                        'points_score'      => null,
                        'remarks'           => 'Auto-created from event registration',
                        'year'              => date('Y', strtotime($validated['event_date']))
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message'            => 'Event and participants successfully saved.',
                'event'              => $event->load('creator', 'coaches', 'athletes'),
                'participants_count' => count($validated['participant_ids'] ?? []),
                'coaches_count'      => count($validated['coach_ids'] ?? [])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create event with participants',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => basename($e->getFile())
            ], 500);
        }
    }

    public function updateEvent(Request $request, Event $event)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot edit events.'
            ], 403);
        }

        if ($user->role === 'Coach') {
            if ($event->created_by !== $user->user_id || $event->event_scope !== 'Team') {
                return response()->json([
                    'message' => 'Unauthorized. You can only edit your own team events.'
                ], 403);
            }
        }

        $validationRules = [
            'event_name'            => ['required', 'max:255'],
            'description'           => ['nullable'],
            'event_type'            => ['required', 'in:' . $this->allowedEventTypes()],
            'sport'                 => ['required', 'max:100'],
            'event_date'            => ['required', 'date'],
            'end_date'              => ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time'            => ['required', 'date_format:H:i'],
            'end_time'              => ['required', 'date_format:H:i', 'after:start_time'],
            'venue'                 => ['required', 'max:255'],
            'organizer'             => ['nullable', 'max:255'],
            'status'                => ['sometimes', 'in:Upcoming,Ongoing,Completed,Cancelled'],
            'max_participants'      => ['nullable', 'integer', 'min:1'],
            'registration_deadline' => ['nullable', 'date'],
            'notes'                 => ['nullable']
        ];

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $validationRules['sport'] = ['required', 'in:' . $coach->sports_coached];
            }
            unset($validationRules['status']);
        }

        $validated = $request->validate($validationRules);

        if (!isset($validated['status']) || $event->status !== 'Cancelled') {
            if (!isset($validated['status'])) {
                $validated['status'] = $this->computeStatus(
                    $validated['event_date'],
                    $validated['end_date'] ?? null
                );
            }
        }

        $event->update($validated);

        return response()->json([
            'message' => 'Event Successfully Updated.',
            'event'   => $event->load('creator', 'coaches', 'athletes')
        ], 200);
    }

    public function updateEventWithParticipants(Request $request, Event $event)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($user->role === 'Coach') {
            if ($event->created_by !== $user->user_id || $event->event_scope !== 'Team') {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $validationRules = [
            'event_name'            => ['required', 'max:255'],
            'description'           => ['nullable'],
            'event_type'            => ['required', 'in:' . $this->allowedEventTypes()],
            'sport'                 => ['required', 'max:100'],
            'event_date'            => ['required', 'date'],
            'end_date'              => ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time'            => ['required', 'date_format:H:i'],
            'end_time'              => ['required', 'date_format:H:i', 'after:start_time'],
            'venue'                 => ['required', 'max:255'],
            'organizer'             => ['nullable', 'max:255'],
            'status'                => ['sometimes', 'in:Upcoming,Ongoing,Completed,Cancelled'],
            'max_participants'      => ['nullable', 'integer', 'min:1'],
            'registration_deadline' => ['nullable', 'date'],
            'notes'                 => ['nullable'],
            'participant_ids'       => ['nullable', 'array'],
            'participant_ids.*'     => ['integer', 'exists:tbl_athletes,athlete_id'],
            'coach_ids'             => ['nullable', 'array'],
            'coach_ids.*'           => ['integer', 'exists:tbl_coaches,coach_id']
        ];

        if ($user->role === 'Coach') {
            $coach = Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $validationRules['sport'] = ['required', 'in:' . $coach->sports_coached];
            }
            unset($validationRules['status']);
        }

        $validated = $request->validate($validationRules);

        if (!isset($validated['status']) || $event->status !== 'Cancelled') {
            if (!isset($validated['status'])) {
                $validated['status'] = $this->computeStatus(
                    $validated['event_date'],
                    $validated['end_date'] ?? null
                );
            }
        }

        DB::beginTransaction();
        try {
            $event->update($validated);

            if (isset($validated['coach_ids'])) {
                $event->coaches()->sync($validated['coach_ids']);
            }

            if (isset($validated['participant_ids'])) {
                $event->athletes()->sync($validated['participant_ids']);

                Record::where('is_deleted', false)
                    ->where('event_name', 'LIKE', '%' . $event->event_name . '%')
                    ->where('sport', $event->sport)
                    ->where('remarks', 'Auto-created from event registration')
                    ->update(['is_deleted' => true]);

                $athletes = Athlete::whereIn('athlete_id', $validated['participant_ids'])->get();

                foreach ($athletes as $athlete) {
                    $athleteName = trim($athlete->first_name . ' ' . ($athlete->middle_name ? $athlete->middle_name . ' ' : '') . $athlete->last_name);
                    $coachName   = $athlete->coach
                        ? trim($athlete->coach->first_name . ' ' . $athlete->coach->last_name)
                        : null;

                    Record::create([
                        'created_by'        => $user->user_id,
                        'creator_role'      => $user->role,
                        'athlete_id'        => $athlete->athlete_id,
                        'event_name'        => $validated['event_name'],
                        'competition_level' => $validated['event_type'],
                        'sport'             => $validated['sport'],
                        'event_date'        => $validated['event_date'],
                        'venue'             => $validated['venue'],
                        'achievement'       => 'Participated',
                        'athlete_name'      => $athleteName,
                        'coach_name'        => $coachName,
                        'category'          => 'Individual',
                        'record_type'       => 'Participation',
                        'points_score'      => null,
                        'remarks'           => 'Auto-created from event registration',
                        'year'              => date('Y', strtotime($validated['event_date']))
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message'            => 'Event and participants successfully updated.',
                'event'              => $event->load('creator', 'coaches', 'athletes'),
                'participants_count' => count($validated['participant_ids'] ?? []),
                'coaches_count'      => count($validated['coach_ids'] ?? [])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update event',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => basename($e->getFile())
            ], 500);
        }
    }

    public function getEventParticipants($eventId)
    {
        $event = Event::with(['athletes', 'coaches'])->findOrFail($eventId);

        $athletes = $event->athletes->map(function ($athlete) {
            return [
                'athlete_id' => $athlete->athlete_id,
                'full_name'  => trim($athlete->first_name . ' ' . ($athlete->middle_name ? $athlete->middle_name . ' ' : '') . $athlete->last_name),
                'school_id'  => $athlete->school_id,
                'sport'      => $athlete->sport
            ];
        });

        $coaches = $event->coaches->map(function ($coach) {
            return [
                'coach_id'  => $coach->coach_id,
                'full_name' => trim($coach->first_name . ' ' . ($coach->middle_name ? $coach->middle_name . ' ' : '') . $coach->last_name),
                'staff_id'  => $coach->staff_id,
                'position'  => $coach->position
            ];
        });

        return response()->json([
            'athletes' => $athletes,
            'coaches'  => $coaches
        ], 200);
    }

    public function destroyEvent(Event $event)
    {
        $user = Auth::user();

        if ($user->role === 'Athlete') {
            return response()->json([
                'message' => 'Unauthorized. Athletes cannot delete events.'
            ], 403);
        }

        if ($user->role === 'Coach') {
            if ($event->created_by !== $user->user_id || $event->event_scope !== 'Team') {
                return response()->json([
                    'message' => 'Unauthorized. You can only delete your own team events.'
                ], 403);
            }
        }

        $event->update(['is_deleted' => true]);

        return response()->json([
            'message' => 'Event Successfully Deleted.'
        ], 200);
    }
}
