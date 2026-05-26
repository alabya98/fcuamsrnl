<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Sport extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_sports';
    protected $primaryKey = 'sport_id';
    protected $fillable = [
        'sport',
        'is_deleted',
    ];

    public function athletes(): HasMany
    {
        return $this->hasMany(Athlete::class, 'sport_id', 'sport_id');
    }
}
