<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AcademicRecord;

class Athlete extends Model
{
    use HasFactory;

    protected $table = 'tbl_athletes';
    protected $primaryKey = 'athlete_id';

    protected $fillable = [
        'user_id',
        'coach_id',
        'school_id',
        'email',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'gender_id',
        'birth_date',
        'age',
        'sport',
        'position',
        'department',
        'valid_id',
        'parent_consent',
        'academic_status',
        'current_grade_percentage',
        'last_grade_upload_date',
        'grace_period_start_date',
        'grace_period_end_date',
        'coach_review_notes',
        'reviewed_by',
        'review_date',
        'attendance_percentage',
        'athlete_status',
        'consecutive_absences',
        'inactive_since',
        'status_changed_by',
        'medical_documents_count',
        'has_parent_consent_file',
        'has_valid_id_file',
        'is_deleted'
    ];

    protected $casts = [
        'birth_date'               => 'date',
        'is_deleted'               => 'boolean',
        'attendance_percentage'    => 'decimal:2',
        'current_grade_percentage' => 'decimal:2',
        'last_grade_upload_date'   => 'datetime',
        'grace_period_start_date'  => 'datetime',
        'grace_period_end_date'    => 'datetime',
        'review_date'              => 'datetime',
        'has_valid_id_file'        => 'boolean',
        'has_parent_consent_file'  => 'boolean',
        'consecutive_absences'     => 'integer',
        'inactive_since'           => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class, 'gender_id', 'gender_id');
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class, 'coach_id', 'coach_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }

    public function statusChanger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'status_changed_by', 'user_id');
    }

    // ✅ Required by getAthletesNeedingReview eager load
    public function academicRecords(): HasMany
    {
        return $this->hasMany(AcademicRecord::class, 'athlete_id', 'athlete_id');
    }

    public function getFullNameAttribute()
    {
        $name = $this->first_name;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        $name .= ' ' . $this->last_name;
        if ($this->suffix_name) {
            $name .= ' ' . $this->suffix_name;
        }
        return $name;
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
    }

    public function scopeActiveStatus($query)
    {
        return $query->where('athlete_status', 'active');
    }

    public function scopeInactiveStatus($query)
    {
        return $query->where('athlete_status', 'inactive');
    }

    public function scopeBySport($query, $sport)
    {
        return $query->where('sport', $sport);
    }

    public function scopeByCoach($query, $coachId)
    {
        return $query->where('coach_id', $coachId);
    }
}
