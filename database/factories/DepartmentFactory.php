<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition()
    {
        return [
            // Fallback name; will be overridden by Sequence in the seeder
            'name' => $this->faker->word(),
        ];
    }
}