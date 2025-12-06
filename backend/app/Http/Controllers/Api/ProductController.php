<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['products' => $products]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create([
            'name' => $request->name,
            'sku' => $request->sku,
            'category' => $request->category,
            'unit_price' => $request->unit_price,
            'description' => $request->description,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json(['product' => $product], 201);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json(['product' => $product]);
    }

    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->update($request->only([
            'name',
            'sku',
            'category',
            'unit_price',
            'description',
            'status',
        ]));

        return response()->json(['product' => $product->fresh()]);
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['success' => true]);
    }
}

