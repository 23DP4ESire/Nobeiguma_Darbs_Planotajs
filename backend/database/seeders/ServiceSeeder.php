<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user (or create one for seeding)
        $admin = User::where('is_admin', true)->first();

        if (!$admin) {
            $admin = User::first();
        }

        $services = [
            [
                'title' => 'Modernā Ģimenes Māja',
                'description' => 'Plašs un gaišs plānojums ar mūsdienīgu dizainu ikdienas komfortam.',
                'price' => 1200,
            ],
            [
                'title' => 'Skandināvu Stila Māja',
                'description' => 'Minimālistiska estētika, dabīgi materiāli un energoefektīvi risinājumi.',
                'price' => 1400,
            ],
            [
                'title' => 'Klasiskā Lauku Māja',
                'description' => 'Silta un tradicionāla pieeja ar funkcionālu plānojumu visām sezonām.',
                'price' => 1000,
            ],
            [
                'title' => 'Vienstāva Kompaktā Māja',
                'description' => 'Praktisks un ekonomisks risinājums nelielām ģimenēm vai pāriem.',
                'price' => 900,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['title' => $service['title']],
                [
                    'description' => $service['description'],
                    'price' => $service['price'],
                    'created_by' => $admin?->id ?? 1,
                ]
            );
        }
    }
}
