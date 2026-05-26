<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PracticeSchedule extends Model
{
    use HasFactory;

    protected $table = 'tbl_practice_schedules';
    protected $primaryKey = 'practice_schedule_id';

    protected $fillable = [
        'coach_id',
        'venue',
        'practice_date',
        'start_time',
        'end_time',
        'total_players',
        'sport',
        'notes',
        'status',
        'attendance_status',
        'admin_notes',
        'approved_by',
        'is_deleted'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'practice_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Relationships
    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class, 'coach_id', 'coach_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'user_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'practice_schedule_id', 'practice_schedule_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'Approved');
    }

    public function scopeByCoach($query, $coachId)
    {
        return $query->where('coach_id', $coachId);
    }

    // Status Check Methods
    public function isPending(): bool
    {
        return $this->status === 'Pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'Approved';
    }

    public function isDeclined(): bool
    {
        return $this->status === 'Declined';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'Completed';
    }
}
