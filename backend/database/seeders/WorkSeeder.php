<?php

namespace Database\Seeders;

use App\Models\Work;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the works table.
     */
    public function run(): void
    {
            // Get the admin user to associate with created works
            $adminUser = \App\Models\User::where('is_admin', true)->first();
            $createdBy = $adminUser?->id ?? 1;
        
            Work::create([
                'title' => 'Moderni projekti',
                'description' => 'Jaunā stila mājas visiem budžetiem',
                'image_path' => 'works/modern-house.jpg',
                'created_by' => $createdBy,
            ]);

            Work::create([
                'title' => 'Personalizēti risinājumi',
                'description' => 'Jūsu iepazīšanai pielāgoti projekti',
                'image_path' => 'works/custom-design.jpg',
                'created_by' => $createdBy,
            ]);
    }
}
