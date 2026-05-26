<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Coach extends Model
{
    use HasFactory;

    protected $table = 'tbl_coaches';
    protected $primaryKey = 'coach_id';

    protected $fillable = [
        'user_id',
        'staff_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'position',
        'sports_coached',
        'contact_email',
        'gender_id',
        'birth_date',
        'is_deleted'
    ];

    protected $casts = [
        'is_deleted' => 'boolean',
        'birth_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class, 'gender_id');
    }

    public function athletes(): HasMany
    {
        return $this->hasMany(Athlete::class, 'coach_id', 'coach_id');
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(
            Event::class,
            'tbl_event_coaches',
            'coach_id',
            'event_id',
            'coach_id',
            'event_id'
        )->withTimestamps();
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

    public function scopeBySport($query, $sport)
    {
        return $query->where('sports_coached', 'LIKE', "%{$sport}%");
    }
}
