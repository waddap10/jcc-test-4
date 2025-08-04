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
        $venueShort = [
            'Hall A',
            'Corridor',
            'Hall B',
            'Cendrawasih',
            'Plenary',
            'Assembly',
            'Merak',
            'Nuri',
            'Kakaktua',
            'Kenari',
            'Murai',
            'Maleo',
            'Summit',
            'Kasuari',
            'Meeting 1',
            'Meeting 2',
        ];

        $venueNames = [
            'Exhibition Hall A',
            'Connecting Corridor',
            'Exhibition Hall B',
            'Cendrawasih Room',
            'Plenary Hall',
            'Assembly Hall',
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

        $venues = array_combine($venueNames, $venueShort);

        foreach ($venues as $name => $short) {
            Venue::factory()->create([
                'name' => $name,
                'short' => $short,
            ]);
        }
    }
}