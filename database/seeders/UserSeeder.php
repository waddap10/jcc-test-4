<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // 1) NON-PIC ROLES: admin & kanit (dept_id = null)
        $roles = [
            ['username' => 'admin', 'name' => 'Administrator', 'role' => 'admin'],
            ['username' => 'kanit', 'name' => 'Kanit',          'role' => 'kanit'],
        ];

        foreach ($roles as $r) {
            $user = User::firstOrCreate(
                ['username' => $r['username']],
                [
                    'name'          => $r['name'],
                    'password'      => bcrypt('qwerty123'),
                    'phone'         => $faker->phoneNumber(),
                    'department_id' => null,
                ]
            );

            $user->assignRole($r['role']);

            // If this user existed from a previous run without a phone, fill it now
            if (empty($user->phone)) {
                $user->phone = $faker->phoneNumber();
                $user->save();
            }
        }

        // 2) PIC USERS: 3 per department, with username derived from name
        Department::all()->each(function (Department $dept) use ($faker) {
            for ($i = 1; $i <= 3; $i++) {
                // Generate a random full name
                $name = $faker->unique()->firstName();

                // Slugify that name for username and append suffix to guarantee uniqueness
                $base     = Str::slug($name);
                $username = "{$base}";

                $user = User::firstOrCreate(
                    ['username' => $username],
                    [
                        'name'          => $name,
                        'password'      => bcrypt('qwerty123'),
                        'phone'         => $faker->phoneNumber(),
                        'department_id' => $dept->id,
                    ]
                );

                $user->assignRole('pic');

                // Ensure phone isn’t empty on re‐run
                if (empty($user->phone)) {
                    $user->phone = $faker->phoneNumber();
                    $user->save();
                }
            }
        });
    }
}