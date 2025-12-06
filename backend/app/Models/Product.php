<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'unit_price',
        'description',
        'status',
        'low_stock_threshold',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
        ];
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class);
    }

    public function movementItems()
    {
        return $this->hasMany(MovementItem::class);
    }
}

