<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $table = 'tbl_announcements';
    protected $primaryKey = 'announcement_id';

    protected $fillable = [
        'created_by',
        'creator_role',
        'title',
        'content',
        'announcement_type',
        'target_audience',
        'target_sport',
        'priority',
        'is_published',
        'publish_date',
        'expiry_date',
        'is_deleted'
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_deleted' => 'boolean',
        'publish_date' => 'date',
        'expiry_date' => 'date'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function scopeForRole($query, $role, $userId = null, $sport = null)
    {
        return $query->where(function ($q) use ($role, $userId, $sport) {
            // Show admin announcements to everyone
            $q->where('creator_role', 'Admin')
              ->where(function ($subQ) use ($role) {
                  $subQ->where('target_audience', 'All')
                       ->orWhere('target_audience', $role . 's');
              });

            // If coach, show their own announcements
            if ($role === 'Coach' && $userId) {
                $q->orWhere('created_by', $userId);
            }

            // If athlete, show announcements for their sport
            if ($role === 'Athlete' && $sport) {
                $q->orWhere(function ($sportQ) use ($sport) {
                    $sportQ->where('creator_role', 'Coach')
                           ->where('target_sport', $sport);
                });
            }
        });
    }
}
