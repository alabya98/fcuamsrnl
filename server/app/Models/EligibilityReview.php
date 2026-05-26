<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EligibilityReview extends Model
{
    use HasFactory;

    protected $table = 'tbl_eligibility_reviews';
    protected $primaryKey = 'review_id';

    protected $fillable = [
        'athlete_id',
        'academic_record_id',
        'previous_status',
        'new_status',
        'grade_percentage',
        'review_reason',
        'coach_decision',
        'coach_notes',
        'reviewed_by',
        'review_date'
    ];

    protected $casts = [
        'grade_percentage' => 'decimal:2',
        'review_date' => 'datetime'
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }

    public function academicRecord(): BelongsTo
    {
        return $this->belongsTo(AcademicRecord::class, 'academic_record_id', 'academic_record_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }
}
