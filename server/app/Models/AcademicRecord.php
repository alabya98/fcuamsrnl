<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicRecord extends Model
{
    use HasFactory;

    protected $table = 'tbl_academic_records';
    protected $primaryKey = 'academic_record_id';

    protected $fillable = [
        'athlete_id',
        'semester_term',
        'grade_image_path',
        'courses',
        'calculated_percentage',
        'gwa_grade',
        'total_units',
        'status',
        'verified_by',
        'verification_date',
        'verification_notes',
        'upload_date'
    ];

    protected $casts = [
        'courses' => 'array',
        'calculated_percentage' => 'decimal:2',
        'gwa_grade' => 'decimal:2',
        'upload_date' => 'datetime',
        'verification_date' => 'datetime'
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by', 'user_id');
    }
}
