<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'tbl_attendance';
    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'practice_schedule_id',
        'athlete_id',
        'practice_date',
        'attendance_status',
        'attendance_notes',
        'marked_by',
        'marked_at',
        'is_submitted',
        'submitted_at'
    ];

    protected $casts = [
        'practice_date' => 'date',
        'marked_at' => 'datetime',
        'submitted_at' => 'datetime',
        'is_submitted' => 'boolean'
    ];

    // Relationships
    public function practiceSchedule(): BelongsTo
    {
        return $this->belongsTo(PracticeSchedule::class, 'practice_schedule_id', 'practice_schedule_id');
    }

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }

    public function markedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'marked_by', 'user_id');
    }

    // Scopes
    public function scopePresent($query)
    {
        return $query->where('attendance_status', 'Present');
    }

    public function scopeAbsent($query)
    {
        return $query->where('attendance_status', 'Absent');
    }

    public function scopeExcused($query)
    {
        return $query->where('attendance_status', 'Excused');
    }

    public function scopeLate($query)
    {
        return $query->where('attendance_status', 'Late');
    }

    public function scopeByAthlete($query, $athleteId)
    {
        return $query->where('athlete_id', $athleteId);
    }

    public function scopeByPractice($query, $practiceScheduleId)
    {
        return $query->where('practice_schedule_id', $practiceScheduleId);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('is_submitted', true);
    }

    public function scopeDraft($query)
    {
        return $query->where('is_submitted', false);
    }
}
