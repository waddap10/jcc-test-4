<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Venue;

class VenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $venueNames = [
            'Exhibition Hall A',
            'Pre-Function Exhibition Hall A',
            'Connecting Corridor',
            'Exhibition Hall B',
            'Pre-Function Exhibition Hall B',
            'Cendrawasih Room',
            'Lobby Cendrawasih',
            'Plenary Hall',
            'Lobby Plenary',
            'Assembly Hall',
            'Lobby Assembly',
            'Merak Room',
            'Nuri Room',
            'Kakaktua Room',
            'Kenari Room',
            'Murai Room',
            'Maleo Room',
            'Summit Room',
            'Kasuari Lounge',
            'Meeting Room 1',
            'Meeting Room 2',
        ];

        foreach ($venueNames as $name) {
            Venue::factory()->create(['name' => $name]);
        }
    }
}