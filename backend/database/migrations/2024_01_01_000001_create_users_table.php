<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('name');
            $table->enum('role', ['super_admin', 'warehouse_manager', 'distributor', 'sales_agent', 'store_manager']);
            $table->unsignedBigInteger('location_id')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index('role');
            $table->index('location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

