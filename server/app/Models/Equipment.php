<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipment extends Model
{
    use HasFactory;

    protected $table = 'tbl_equipment';
    protected $primaryKey = 'equipment_id';

    protected $fillable = [
        'coach_id',
        'sport',
        'equipment_name',
        'total_quantity',
        'available_quantity',
        'damaged_quantity',
        'lost_quantity',
        'condition',
        'notes',
        'is_request_printed',
        'last_updated_by',
        'is_deleted'
    ];

    protected $casts = [
        'total_quantity'      => 'integer',
        'available_quantity'  => 'integer',
        'damaged_quantity'    => 'integer',
        'lost_quantity'       => 'integer',
        'is_request_printed'  => 'boolean',
        'is_deleted'          => 'boolean',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class, 'coach_id', 'coach_id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_updated_by', 'user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
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
