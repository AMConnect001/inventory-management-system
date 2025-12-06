<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'role',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function movementsFrom()
    {
        return $this->hasMany(Movement::class, 'from_location_id');
    }

    public function movementsTo()
    {
        return $this->hasMany(Movement::class, 'to_location_id');
    }
}

