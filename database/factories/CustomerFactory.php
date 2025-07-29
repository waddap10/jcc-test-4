<?php

// database/factories/CustomerFactory.php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organizer'      => $this->faker->company(),
            'address'        => $this->faker->address(),
            'contact_person' => $this->faker->name(),
            'phone'          => $this->faker->phoneNumber(),
            'email'          => $this->faker->unique()->safeEmail(),
        ];
    }
}
