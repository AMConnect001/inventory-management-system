<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActivityLogRequest;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = $request->get('limit', 100);

        $query = ActivityLog::with('user:id,name,email')
            ->select('activity_logs.*');

        // Filter by user location if not admin
        if (!$user->isSuperAdmin() && $user->location_id) {
            // This would need a join with movements or inventory to filter by location
            // For now, show all activities
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'user_name' => $log->user ? $log->user->name : null,
                    'user_email' => $log->user ? $log->user->email : null,
                    'created_at' => $log->created_at,
                ];
            });

        return response()->json(['logs' => $logs]);
    }

    public function store(StoreActivityLogRequest $request): JsonResponse
    {
        $log = ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $request->action,
            'description' => $request->description,
            'entity_type' => $request->entity_type,
            'entity_id' => $request->entity_id,
        ]);

        $log->load('user:id,name,email');

        return response()->json([
            'log' => [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'action' => $log->action,
                'description' => $log->description,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'user_name' => $log->user ? $log->user->name : null,
                'user_email' => $log->user ? $log->user->email : null,
                'created_at' => $log->created_at,
            ],
        ], 201);
    }
}

