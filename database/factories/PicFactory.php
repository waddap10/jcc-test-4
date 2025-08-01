<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pic>
 */
class PicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
{
    return [
        'name'          => $this->faker->name(),
        'department_id' => $this->faker->numberBetween(1, 11),
        'phone'         => $this->faker->phoneNumber(),
    ];
}
}
