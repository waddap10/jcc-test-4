<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class AccountController extends Controller
{
    public function index()
    {
        $users = User::with(['department:id,name', 'roles:id,name'])
            ->select(['id', 'name', 'username', 'phone', 'department_id', 'created_at'])
            ->paginate(15);

        return Inertia::render('Admin/Accounts/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        $departments = Department::select(['id', 'name'])->get();
        $roles = Role::select(['id', 'name'])->get();

        return Inertia::render('Admin/Accounts/Create', [
            'departments' => $departments,
            'roles' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'department_id' => 'nullable|exists:departments,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'department_id' => $validated['department_id'] ?? null,
        ]);

        if (!empty($validated['roles'])) {
            $user->assignRole($validated['roles']);
        }

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Account created successfully.');
    }

    public function show(User $account)
    {
        $account->load([
            'department:id,name',
            'roles:id,name'
        ]);

        return Inertia::render('Admin/Accounts/Show', [
            'account' => $account
        ]);
    }

    public function edit(User $account)
    {
        $departments = Department::select(['id', 'name'])->get();
        $roles = Role::select(['id', 'name'])->get();
        
        $account->load(['department:id,name', 'roles:id,name']);

        return Inertia::render('Admin/Accounts/Edit', [
            'account' => $account,
            'departments' => $departments,
            'roles' => $roles
        ]);
    }

    public function update(Request $request, User $account)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $account->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'department_id' => 'nullable|exists:departments,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id'
        ]);

        $updateData = [
            'name' => $validated['name'],
            'username' => $validated['username'],
            'phone' => $validated['phone'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $account->update($updateData);

        if (isset($validated['roles'])) {
            $account->syncRoles($validated['roles']);
        }

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    public function destroy(User $account)
    {
        $account->delete();

        return redirect()
            ->route('admin.accounts.index')
            ->with('success', 'Account deleted successfully.');
    }

    public function attachRole(Request $request, User $account)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $role = Role::findById($validated['role_id']);
        
        if ($account->hasRole($role)) {
            return redirect()
                ->back()
                ->with('error', 'User already has this role.');
        }

        $account->assignRole($role);

        return redirect()
            ->back()
            ->with('success', 'Role assigned successfully.');
    }

    public function detachRole(User $account, Role $role)
    {
        if (!$account->hasRole($role)) {
            return redirect()
                ->back()
                ->with('error', 'User does not have this role.');
        }

        $account->removeRole($role);

        return redirect()
            ->back()
            ->with('success', 'Role removed successfully.');
    }

    public function attachDepartment(Request $request, User $account)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id'
        ]);

        $picRole = Role::where('name', 'pic')->first();
        
        if (!$picRole || !$account->hasRole($picRole)) {
            return redirect()
                ->back()
                ->with('error', 'User must have PIC role to be assigned to a department.');
        }

        $account->update(['department_id' => $validated['department_id']]);

        return redirect()
            ->back()
            ->with('success', 'Department assigned successfully.');
    }

    public function detachDepartment(User $account)
    {
        $account->update(['department_id' => null]);

        return redirect()
            ->back()
            ->with('success', 'Department removed successfully.');
    }
}