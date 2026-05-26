<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentRequest extends Model
{
    use HasFactory;

    protected $table = 'tbl_equipment_requests';
    protected $primaryKey = 'request_id';

    protected $fillable = [
        'coach_id',
        'sport',
        'equipment_name',
        'quantity_requested',
        'reason',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
        'is_printed',
        'printed_at',
        'printed_by',
        'print_count',
        'is_deleted'
    ];

    protected $casts = [
        'quantity_requested' => 'integer',
        'reviewed_at'        => 'datetime',
        'is_printed'         => 'boolean',
        'printed_at'         => 'datetime',
        'print_count'        => 'integer',
        'is_deleted'         => 'boolean',
    ];

    public function coach(): BelongsTo
    {
        return $this->belongsTo(Coach::class, 'coach_id', 'coach_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'printed_by', 'user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', 0);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'Approved');
    }

    public function scopeUnprintedApproved($query)
    {
        return $query->where('status', 'Approved')
                     ->where('is_printed', false);
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
