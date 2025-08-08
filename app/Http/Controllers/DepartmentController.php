<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::withCount(['users', 'beo', 'packages'])
            ->select(['id', 'name', 'created_at'])
            ->paginate(15);

        return Inertia::render('Admin/Departments/Index', [
            'departments' => $departments
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Departments/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ]);

        Department::create($validated);

        return redirect()
            ->route('admin.departments.index')
            ->with('success', 'Department created successfully.');
    }

    public function show(Department $department)
    {
        $department->load([
            'users:id,name,email,department_id',
            'beo:id,name,department_id',
            'packages:id,name,department_id'
        ])->loadCount(['users', 'beo', 'packages']);

        return Inertia::render('Admin/Departments/Show', [
            'department' => $department
        ]);
    }

    public function edit(Department $department)
    {
        return Inertia::render('Admin/Departments/Edit', [
            'department' => $department
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $department->id,
        ]);

        $department->update($validated);

        return redirect()
            ->route('admin.departments.index')
            ->with('success', 'Department updated successfully.');
    }

    public function destroy(Department $department)
    {
        if ($department->users()->exists()) {
            return redirect()
                ->route('admin.departments.index')
                ->with('error', 'Cannot delete department. It has associated users.');
        }

        if ($department->beo()->exists()) {
            return redirect()
                ->route('admin.departments.index')
                ->with('error', 'Cannot delete department. It has associated BEOs.');
        }

        if ($department->packages()->exists()) {
            return redirect()
                ->route('admin.departments.index')
                ->with('error', 'Cannot delete department. It has associated packages.');
        }

        $department->delete();

        return redirect()
            ->route('admin.departments.index')
            ->with('success', 'Department deleted successfully.');
    }
}