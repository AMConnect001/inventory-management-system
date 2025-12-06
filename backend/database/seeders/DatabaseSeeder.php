<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create locations
        $locations = [
            ['name' => 'Main Warehouse', 'type' => 'warehouse', 'role' => 'warehouse_manager'],
            ['name' => 'Distributor A', 'type' => 'distributor', 'role' => 'distributor'],
            ['name' => 'Distributor B', 'type' => 'distributor', 'role' => 'distributor'],
            ['name' => 'Sales Agent 1', 'type' => 'sales_agent', 'role' => 'sales_agent'],
            ['name' => 'Sales Agent 2', 'type' => 'sales_agent', 'role' => 'sales_agent'],
            ['name' => 'Store A', 'type' => 'store', 'role' => 'store_manager'],
            ['name' => 'Store B', 'type' => 'store', 'role' => 'store_manager'],
        ];

        foreach ($locations as $locationData) {
            Location::firstOrCreate(
                ['name' => $locationData['name']],
                $locationData
            );
        }

        // Create default users
        // Password: admin123
        $users = [
            [
                'email' => 'admin@inventory.com',
                'password' => Hash::make('admin123'),
                'name' => 'Super Admin',
                'role' => 'super_admin',
                'location_id' => null,
            ],
            [
                'email' => 'warehouse@inventory.com',
                'password' => Hash::make('admin123'),
                'name' => 'Warehouse Manager',
                'role' => 'warehouse_manager',
                'location_id' => 1,
            ],
            [
                'email' => 'distributor@inventory.com',
                'password' => Hash::make('admin123'),
                'name' => 'Distributor',
                'role' => 'distributor',
                'location_id' => 2,
            ],
            [
                'email' => 'agent@inventory.com',
                'password' => Hash::make('admin123'),
                'name' => 'Sales Agent',
                'role' => 'sales_agent',
                'location_id' => 4,
            ],
            [
                'email' => 'store@inventory.com',
                'password' => Hash::make('admin123'),
                'name' => 'Store Manager',
                'role' => 'store_manager',
                'location_id' => 6,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}

