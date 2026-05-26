<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Carbon\Carbon;

class Event extends Model
{
    use HasFactory;

    protected $table = 'tbl_events';
    protected $primaryKey = 'event_id';

    protected $fillable = [
        'created_by',
        'creator_role',
        'event_scope',
        'event_name',
        'description',
        'event_type',
        'sport',
        'event_date',
        'end_date',
        'start_time',
        'end_time',
        'venue',
        'organizer',
        'status',           // real DB column
        'max_participants',
        'registration_deadline',
        'notes',
        'is_deleted'
    ];

    protected $casts = [
        'event_date'            => 'date:Y-m-d',
        'end_date'              => 'date:Y-m-d',
        'registration_deadline' => 'date:Y-m-d',
        'is_deleted'            => 'boolean',
    ];

    // No $appends, no getStatusAttribute — status is a real DB column

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(
            Coach::class,
            'tbl_event_coaches',
            'event_id',
            'coach_id',
            'event_id',
            'coach_id'
        )->withTimestamps();
    }

    public function athletes(): BelongsToMany
    {
        return $this->belongsToMany(
            Athlete::class,
            'tbl_event_athletes',
            'event_id',
            'athlete_id',
            'event_id',
            'athlete_id'
        )->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', Carbon::today())
                     ->where('status', '!=', 'Cancelled');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'Cancelled');
    }
}
