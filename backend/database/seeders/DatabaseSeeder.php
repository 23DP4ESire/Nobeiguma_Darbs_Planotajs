<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'admin@test.lv'],
            [
                'name' => 'admin',
                'password' => 'admin11',
                'is_admin' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'is_admin' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'testresult@test.lv'],
            [
                'name' => 'testresult',
                'password' => 'testresult',
                'is_admin' => false,
            ]
        );

        // Seed services
        $this->call(ServiceSeeder::class);

        // Seed works
        $this->call(WorkSeeder::class);
    }
}
