<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovementActivity extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'movement_id',
        'action',
        'description',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function movement()
    {
        return $this->belongsTo(Movement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

