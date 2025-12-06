<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddInitialStockRequest;
use App\Http\Requests\UpdateInventoryRequest;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Location;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $query = Inventory::with(['product', 'location']);

        // Filter by location if user has a location (non-admin)
        if (!$user->isSuperAdmin() && $user->location_id) {
            $query->where('location_id', $user->location_id);
        } elseif ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        $inventory = $query->orderBy('updated_at', 'desc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'location_id' => $item->location_id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'product_name' => $item->product->name,
                'category' => $item->product->category,
                'sku' => $item->product->sku,
                'location_name' => $item->location->name,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });

        return response()->json(['inventory' => $inventory]);
    }

    public function store(UpdateInventoryRequest $request): JsonResponse
    {
        $existing = Inventory::where('location_id', $request->location_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            // Update existing
            $existing->increment('quantity', $request->quantity);
            if ($request->has('unit_price')) {
                $existing->unit_price = $request->unit_price;
            }
            $existing->save();
            
            $inventory = $existing->load(['product', 'location']);
        } else {
            // Create new
            $inventory = Inventory::create([
                'location_id' => $request->location_id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price ?? 0,
            ]);
            
            $inventory->load(['product', 'location']);
        }

        return response()->json(['inventory' => $inventory], 201);
    }

    public function addInitialStock(AddInitialStockRequest $request): JsonResponse
    {
        $user = auth()->user();

        // Only warehouse managers can add initial stock
        if (!$user->isSuperAdmin() && !$user->isWarehouseManager()) {
            return response()->json([
                'error' => 'Only warehouse managers can add initial stock',
            ], 403);
        }

        $location = Location::findOrFail($request->location_id);

        if ($location->type !== 'warehouse') {
            return response()->json([
                'error' => 'Initial stock can only be added to warehouses',
            ], 400);
        }

        // Check if user has permission for this location (non-admin)
        if (!$user->isSuperAdmin() && $user->location_id !== $request->location_id) {
            return response()->json([
                'error' => 'You can only add stock to your own warehouse',
            ], 403);
        }

        $product = Product::findOrFail($request->product_id);

        $existing = Inventory::where('location_id', $request->location_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            $existing->increment('quantity', $request->quantity);
            if ($request->has('unit_price')) {
                $existing->unit_price = $request->unit_price;
            } else {
                $existing->unit_price = $product->unit_price;
            }
            $existing->save();
            $inventory = $existing;
        } else {
            $inventory = Inventory::create([
                'location_id' => $request->location_id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price ?? $product->unit_price ?? 0,
            ]);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'Initial Stock Added',
            'description' => "Added {$request->quantity} units of {$product->name} to {$location->name}",
            'entity_type' => 'inventory',
            'entity_id' => $request->location_id,
        ]);

        $inventory->load(['product', 'location']);

        return response()->json(['inventory' => $inventory], 201);
    }
}

