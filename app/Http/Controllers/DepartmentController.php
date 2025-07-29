<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
{
    $departments = Department::orderBy('created_at')->get();

    return Inertia::render('departments/index', [
        'departments' => $departments,
        'flash'       => [
            'message' => session()->get('message'),
        ],
    ]);
}


    public function create()
    {
        return Inertia::render('departments/create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        Department::create($request->only('name'));
        return redirect()->route('departments.index');
    }

    public function destroy(Department $department)
{
    $department->delete();
    return redirect()->route('departments.index')
                   ->with('message', 'Department deleted.');
}
}