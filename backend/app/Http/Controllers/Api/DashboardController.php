<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\Movement;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $user = auth()->user();

        // Get products count
        $totalProducts = Product::where('status', 'active')->count();

        // Get inventory stats
        $inventoryQuery = Inventory::select(
            DB::raw('SUM(quantity) as total_quantity'),
            DB::raw('SUM(quantity * unit_price) as total_value'),
            DB::raw('COUNT(DISTINCT product_id) as unique_products')
        );

        if (!$user->isSuperAdmin() && $user->location_id) {
            $inventoryQuery->where('location_id', $user->location_id);
        }

        $inventoryStats = $inventoryQuery->first();
        $stats = $inventoryStats ? [
            'total_quantity' => $inventoryStats->total_quantity ?? 0,
            'total_value' => $inventoryStats->total_value ?? 0,
            'unique_products' => $inventoryStats->unique_products ?? 0,
        ] : [
            'total_quantity' => 0,
            'total_value' => 0,
            'unique_products' => 0,
        ];

        // Get pending movements count
        $movementsQuery = Movement::where('status', 'pending');

        if (!$user->isSuperAdmin() && $user->location_id) {
            $movementsQuery->where(function ($q) use ($user) {
                $q->where('from_location_id', $user->location_id)
                  ->orWhere('to_location_id', $user->location_id);
            });
        }

        $pendingMovements = $movementsQuery->count();

        // Get activity logs count
        $logsQuery = ActivityLog::query();

        if (!$user->isSuperAdmin() && $user->location_id) {
            // Filter by user's activities
            $logsQuery->where('user_id', $user->id);
        }

        $activityLogs = $logsQuery->count();

        // Calculate average value
        $avgValue = $stats['total_quantity'] > 0
            ? ($stats['total_value'] / $stats['total_quantity'])
            : 0;

        return response()->json([
            'stats' => [
                'totalProducts' => $totalProducts,
                'totalInventory' => (int) $stats['total_quantity'],
                'pendingMovements' => $pendingMovements,
                'activityLogs' => $activityLogs,
                'totalValue' => (float) $stats['total_value'],
                'avgValue' => (float) $avgValue,
                'uniqueProducts' => (int) $stats['unique_products'],
            ],
        ]);
    }
}

