<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Define
            $resources = ['venue', 'department', 'pic', 'customer', 'event', 'beo', 'user'];
            $actions   = ['create', 'read', 'update', 'delete'];
            
            // 2. Create CRUD permissions
            foreach ($resources as $res) {
                foreach ($actions as $act) {
                    Permission::firstOrCreate(
                        ['name' => "{$act}-{$res}"],
                        ['guard_name' => 'web']
                    );
                }
            }

            // 3. Custom permissions
            Permission::firstOrCreate(['name' => 'read-beo-pic'], ['guard_name' => 'web']);
            Permission::firstOrCreate(['name' => 'accept-beo'],   ['guard_name' => 'web']);

            // 4. Create roles
            $roles = ['admin', 'sales', 'kanit', 'pic'];
            foreach ($roles as $role) {
                Role::firstOrCreate(['name' => $role], ['guard_name' => 'web']);
            }

            // 5. Assign super-admin
            $admin = Role::findByName('admin');
            $admin->syncPermissions(Permission::all());

            // 6. Role-specific mappings
            $map = [
                'kanit' => ['read-beo', 'accept-beo'],
                'pic'   => ['read-beo-pic'],
            ];

            foreach ($map as $role => $perms) {
                Role::findByName($role)->syncPermissions($perms);
            }
        });
    }
}