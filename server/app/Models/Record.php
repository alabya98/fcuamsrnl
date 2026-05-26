<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Record extends Model
{
    use HasFactory;

    protected $table = 'tbl_records';
    protected $primaryKey = 'record_id';

    protected $fillable = [
        'created_by',
        'creator_role',
        'athlete_id', // ✅ ADD THIS
        'event_name',
        'competition_level',
        'sport',
        'event_date',
        'venue',
        'achievement',
        'athlete_name',
        'coach_name',
        'category',
        'record_type',
        'points_score',
        'remarks',
        'year',
        'is_deleted'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'event_date' => 'date',
        'year' => 'integer'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    // ✅ ADD THIS: Athlete relationship
    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }
}
