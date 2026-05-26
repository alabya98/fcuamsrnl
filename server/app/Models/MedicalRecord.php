<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $table = 'tbl_medical_records';
    protected $primaryKey = 'medical_record_id';

    protected $fillable = [
        'athlete_id',
        'record_date',
        'record_type',
        'diagnosis',
        'treatment',
        'prescribed_medication',
        'doctor_name',
        'hospital_clinic',
        'notes',
        'follow_up_date',
        'status',
        'is_deleted'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'record_date' => 'date',
        'follow_up_date' => 'date'
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
