<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMovementRequest;
use App\Http\Requests\UpdateMovementRequest;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\MovementActivity;
use App\Models\Inventory;
use App\Models\Location;
use App\Services\LocationHierarchyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovementController extends Controller
{
    protected LocationHierarchyService $hierarchyService;

    public function __construct(LocationHierarchyService $hierarchyService)
    {
        $this->hierarchyService = $hierarchyService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = Movement::with(['fromLocation', 'toLocation', 'creator', 'items.product']);

        // Filter by user location if not admin
        if (!$user->isSuperAdmin() && $user->location_id) {
            $query->where(function ($q) use ($user) {
                $q->where('from_location_id', $user->location_id)
                  ->orWhere('to_location_id', $user->location_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from_location_id')) {
            $query->where('from_location_id', $request->from_location_id);
        }

        if ($request->has('to_location_id')) {
            $query->where('to_location_id', $request->to_location_id);
        }

        $movements = $query->orderBy('created_at', 'desc')->get();

        // Format response
        $formattedMovements = $movements->map(function ($movement) {
            return [
                'id' => $movement->id,
                'from_location_id' => $movement->from_location_id,
                'to_location_id' => $movement->to_location_id,
                'status' => $movement->status,
                'notes' => $movement->notes,
                'created_by' => $movement->created_by,
                'from_location_name' => $movement->fromLocation->name,
                'to_location_name' => $movement->toLocation->name,
                'created_by_name' => $movement->creator->name,
                'created_at' => $movement->created_at,
                'updated_at' => $movement->updated_at,
                'items' => $movement->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'movement_id' => $item->movement_id,
                        'product_id' => $item->product_id,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'product_name' => $item->product->name,
                    ];
                }),
            ];
        });

        return response()->json(['movements' => $formattedMovements]);
    }

    public function store(StoreMovementRequest $request): JsonResponse
    {
        $user = auth()->user();

        $fromLocation = Location::findOrFail($request->from_location_id);
        $toLocation = Location::findOrFail($request->to_location_id);

        // Check if user can send from this location (non-admin users can only send from their location)
        if (!$user->isSuperAdmin() && $user->location_id !== $request->from_location_id) {
            return response()->json([
                'error' => 'You can only send stock from your own location',
            ], 403);
        }

        // Validate hierarchy
        $validation = $this->hierarchyService->validateMovement($fromLocation->type, $toLocation->type);
        if (!$validation['valid']) {
            return response()->json([
                'error' => $validation['error'],
                'allowedTypes' => $validation['allowedTypes'] ?? [],
            ], 400);
        }

        // Validate stock availability
        foreach ($request->items as $item) {
            $inventory = Inventory::where('location_id', $request->from_location_id)
                ->where('product_id', $item['product_id'])
                ->first();

            if (!$inventory || $inventory->quantity < $item['quantity']) {
                return response()->json([
                    'error' => "Insufficient stock for product {$item['product_id']}",
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Create movement
            $movement = Movement::create([
                'from_location_id' => $request->from_location_id,
                'to_location_id' => $request->to_location_id,
                'status' => 'pending',
                'notes' => $request->notes,
                'created_by' => $user->id,
            ]);

            // Add movement items
            foreach ($request->items as $item) {
                MovementItem::create([
                    'movement_id' => $movement->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'] ?? 0,
                ]);
            }

            // Add activity log
            MovementActivity::create([
                'movement_id' => $movement->id,
                'action' => 'Created',
                'description' => 'Movement created',
                'user_id' => $user->id,
            ]);

            DB::commit();

            $movement->load(['fromLocation', 'toLocation', 'items.product']);

            return response()->json(['movement' => $movement], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Internal server error',
            ], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        $movement = Movement::with(['fromLocation', 'toLocation', 'creator', 'items.product', 'activities.user'])
            ->findOrFail($id);

        $formattedMovement = [
            'id' => $movement->id,
            'from_location_id' => $movement->from_location_id,
            'to_location_id' => $movement->to_location_id,
            'status' => $movement->status,
            'notes' => $movement->notes,
            'created_by' => $movement->created_by,
            'from_location_name' => $movement->fromLocation->name,
            'to_location_name' => $movement->toLocation->name,
            'created_by_name' => $movement->creator->name,
            'created_at' => $movement->created_at,
            'updated_at' => $movement->updated_at,
            'items' => $movement->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'movement_id' => $item->movement_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'product_name' => $item->product->name,
                ];
            }),
            'activities' => $movement->activities->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'movement_id' => $activity->movement_id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'user_id' => $activity->user_id,
                    'user_name' => $activity->user ? $activity->user->name : null,
                    'created_at' => $activity->created_at,
                ];
            }),
        ];

        return response()->json(['movement' => $formattedMovement]);
    }

    public function update(UpdateMovementRequest $request, string $id): JsonResponse
    {
        $movement = Movement::with('items')->findOrFail($id);

        DB::beginTransaction();
        try {
            // Update status if provided
            if ($request->has('status')) {
                $movement->status = $request->status;
                $movement->save();

                // If status is 'received', update inventory
                if ($request->status === 'received') {
                    // Deduct from source location
                    foreach ($movement->items as $item) {
                        $sourceInventory = Inventory::where('location_id', $movement->from_location_id)
                            ->where('product_id', $item->product_id)
                            ->first();

                        if ($sourceInventory) {
                            $sourceInventory->decrement('quantity', $item->quantity);
                        }
                    }

                    // Add to destination location
                    foreach ($movement->items as $item) {
                        $destInventory = Inventory::where('location_id', $movement->to_location_id)
                            ->where('product_id', $item->product_id)
                            ->first();

                        if ($destInventory) {
                            $destInventory->increment('quantity', $item->quantity);
                            $destInventory->unit_price = $item->unit_price;
                            $destInventory->save();
                        } else {
                            Inventory::create([
                                'location_id' => $movement->to_location_id,
                                'product_id' => $item->product_id,
                                'quantity' => $item->quantity,
                                'unit_price' => $item->unit_price,
                            ]);
                        }
                    }
                }
            }

            // Add activity if provided
            if ($request->has('action')) {
                MovementActivity::create([
                    'movement_id' => $movement->id,
                    'action' => $request->action,
                    'description' => $request->description,
                    'user_id' => auth()->id(),
                ]);
            }

            DB::commit();

            $movement->load(['fromLocation', 'toLocation']);

            return response()->json(['movement' => $movement]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Internal server error',
            ], 500);
        }
    }
}

