<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'tbl_users';
    protected $primaryKey = 'user_id';

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'gender_id',
        'birth_date',
        'age',
        'username',
        'role',
        'password',
        'is_deleted',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
    ];


    protected $appends = ['profile_picture_url'];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'is_deleted' => 'boolean',
        ];
    }

    public function gender(): BelongsTo
    {
        return $this->belongsTo(Gender::class, 'gender_id', 'gender_id');
    }

    public function getProfilePictureUrlAttribute(): ?string
    {
        if ($this->profile_picture) {
            $cleanPath = preg_replace('#^public/#', '', $this->profile_picture);
            return asset('storage/' . $cleanPath);
        }

        return null;
    }
}
