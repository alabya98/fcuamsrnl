<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AthleteDocument extends Model
{
    use HasFactory;

    protected $table = 'tbl_athlete_documents';
    protected $primaryKey = 'document_id';

    protected $fillable = [
        'athlete_id',
        'document_type',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'valid_until',
        'notes',
        'is_visible_to_admin',
        'is_deleted'
    ];

    protected $casts = [
        'is_visible_to_admin' => 'boolean',
        'is_deleted' => 'boolean',
        'reviewed_at' => 'datetime',
        'valid_until' => 'date',
        'file_size' => 'integer'
    ];

    public function athlete(): BelongsTo
    {
        return $this->belongsTo(Athlete::class, 'athlete_id', 'athlete_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'user_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_deleted', false);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByAthlete($query, $athleteId)
    {
        return $query->where('athlete_id', $athleteId);
    }

    // Get file size in human-readable format
    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    // Check if document is still valid
    public function getIsValidAttribute()
    {
        if (!$this->valid_until || $this->status !== 'Approved') {
            return false;
        }
        return $this->valid_until >= now()->toDateString();
    }

    // Get days remaining until expiry
    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->valid_until || $this->status !== 'Approved') {
            return null;
        }
        $now = now();
        $validUntil = \Carbon\Carbon::parse($this->valid_until);
        return $now->diffInDays($validUntil, false);
    }
}
