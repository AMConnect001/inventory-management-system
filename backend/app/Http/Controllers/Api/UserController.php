<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        // Only super admin can view all users
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $users = User::with('location:id,name')
            ->select('id', 'email', 'name', 'role', 'location_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'role' => $user->role,
                    'location_id' => $user->location_id,
                    'location_name' => $user->location ? $user->location->name : null,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json(['users' => $users]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $currentUser = auth()->user();

        // Only super admin can create users
        if (!$currentUser->isSuperAdmin()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'name' => $request->name,
            'role' => $request->role,
            'location_id' => $request->location_id,
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $currentUser->id,
            'action' => 'User Created',
            'description' => "Created user: {$request->email}",
            'entity_type' => 'user',
            'entity_id' => $user->id,
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'location_id' => $user->location_id,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $currentUser = auth()->user();

        // Only super admin can view any user, others can only view themselves
        if (!$currentUser->isSuperAdmin() && $currentUser->id != $id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user = User::with('location:id,name')
            ->select('id', 'email', 'name', 'role', 'location_id', 'created_at')
            ->findOrFail($id);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'location_id' => $user->location_id,
                'location_name' => $user->location ? $user->location->name : null,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $currentUser = auth()->user();

        // Only super admin can update any user, others can only update themselves
        if (!$currentUser->isSuperAdmin() && $currentUser->id != $id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $user = User::findOrFail($id);

        $updateData = [];

        if ($request->has('email')) {
            $updateData['email'] = $request->email;
        }

        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        // Only super admin can change role
        if ($request->has('role') && $currentUser->isSuperAdmin()) {
            $updateData['role'] = $request->role;
        }

        if ($request->has('location_id')) {
            $updateData['location_id'] = $request->location_id;
        }

        if (empty($updateData)) {
            return response()->json(['error' => 'No fields to update'], 400);
        }

        $user->update($updateData);

        // Log activity
        ActivityLog::create([
            'user_id' => $currentUser->id,
            'action' => 'User Updated',
            'description' => "Updated user: {$user->email}",
            'entity_type' => 'user',
            'entity_id' => $user->id,
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'location_id' => $user->location_id,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $currentUser = auth()->user();

        // Only super admin can delete users
        if (!$currentUser->isSuperAdmin()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Cannot delete yourself
        if ($currentUser->id == $id) {
            return response()->json([
                'error' => 'Cannot delete your own account',
            ], 400);
        }

        $user = User::findOrFail($id);
        $userEmail = $user->email;
        $user->delete();

        // Log activity
        ActivityLog::create([
            'user_id' => $currentUser->id,
            'action' => 'User Deleted',
            'description' => "Deleted user: {$userEmail}",
            'entity_type' => 'user',
            'entity_id' => $id,
        ]);

        return response()->json(['success' => true]);
    }
}

