<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            'front_desk'          => 'Front Desk',
            'housekeeping'        => 'Housekeeping',
            'maintenance'         => 'Maintenance',
            'security'            => 'Security',
            'food_and_beverage'   => 'Food & Beverage',
            'sales_and_marketing' => 'Sales & Marketing',
            'accounting_finance'  => 'Accounting & Finance',
            'human_resources'     => 'Human Resources',
            'it_support'          => 'IT Support',
            'events'              => 'Events',
            'engineering'         => 'Engineering',
        ];

        // Insert each department with a fixed ID (1–11) and timestamps
        foreach (array_values($departments) as $index => $label) {
            Department::factory()->create(['name' => $label]);
        }
    }
}