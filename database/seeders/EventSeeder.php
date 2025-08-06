<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing events (optional)
        Event::truncate();

        // Create one event for each event type (avoiding duplicates)
        $eventTypes = [
            'conference',
            'workshop', 
            'seminar',
            'webinar',
            'training',
            'meeting',
            'exhibition',
            'competition',
            'festival',
            'concert',
            'sports',
            'networking',
        ];

        foreach ($eventTypes as $eventType) {
            // Use updateOrCreate to avoid duplicates
            Event::updateOrCreate(
                ['event_type' => $eventType],
                ['event_type' => $eventType]
                // code will be automatically set by the model
            );
        }

        $this->command->info('Events seeded successfully!');
        $this->command->info('Total events created: ' . Event::count());
        
        // Display created events
        $this->command->info('Created events:');
        Event::all()->each(function ($event) {
            $this->command->line("- {$event->event_type} (Code: {$event->code})");
        });
    }
}