<?php

// database/factories/VenueFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VenueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'photo' => $this->faker->imageUrl(640, 480, 'business', true, 'venue'),
            'description' => $this->faker->sentence(),
            'dimension_m' => $this->faker->randomElement(['10 x 20', '15 x 25', '20 x 30']),
            'dimension_f' => $this->faker->randomElement(['32 x 65', '49 x 82', '65 x 98']),
            'setup_banquet' => $this->faker->numberBetween(50, 300),
            'setup_classroom' => $this->faker->numberBetween(30, 200),
            'setup_theater' => $this->faker->numberBetween(50, 400),
            'setup_reception' => $this->faker->numberBetween(60, 350),
            'floor_plan' => $this->faker->imageUrl(600, 400, 'floorplan', true),
        ];
    }
}