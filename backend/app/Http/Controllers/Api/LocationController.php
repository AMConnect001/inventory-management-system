<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Location::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $locations = $query->orderBy('name', 'asc')->get();

        return response()->json(['locations' => $locations]);
    }
}

