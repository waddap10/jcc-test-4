<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VenueController extends Controller
{
    // Sales methods (Read-only access)
    public function salesIndex()
    {
        $venues = Venue::select([
            'id', 
            'name', 
            'short', 
            'photo', 
            'dimension_m', 
            'dimension_f', 
            'setup_banquet',
            'setup_classroom',
            'setup_theater',
            'setup_reception'
        ])->paginate(15);

        return Inertia::render('Venues/Index', [
            'venues' => $venues,
            'canCreate' => false,
            'canEdit' => false,
            'canDelete' => false
        ]);
    }

    public function salesShow(Venue $venue)
    {
        return Inertia::render('Venues/Show', [
            'venue' => $venue,
            'canEdit' => false,
            'canDelete' => false
        ]);
    }

    // Admin methods (Full CRUD access)
    public function adminIndex()
    {
        $venues = Venue::select([
            'id', 
            'name', 
            'short', 
            'photo', 
            'dimension_m', 
            'dimension_f', 
            'created_at'
        ])->paginate(15);

        return Inertia::render('admin/venues/index', [
            'venues' => $venues,
            'canCreate' => true,
            'canEdit' => true,
            'canDelete' => true
        ]);
    }

    public function adminShow(Venue $venue)
    {
        return Inertia::render('Admin/Venues/Show', [
            'venue' => $venue,
            'canEdit' => true,
            'canDelete' => true
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Venues/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short' => 'required|string|max:50|unique:venues,short',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'dimension_m' => 'nullable|numeric|min:0',
            'dimension_f' => 'nullable|numeric|min:0',
            'setup_banquet' => 'nullable|integer|min:0',
            'setup_classroom' => 'nullable|integer|min:0',
            'setup_theater' => 'nullable|integer|min:0',
            'setup_reception' => 'nullable|integer|min:0',
            'floor_plan' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('venues/photos', 'public');
        }

        if ($request->hasFile('floor_plan')) {
            $validated['floor_plan'] = $request->file('floor_plan')->store('venues/floor_plans', 'public');
        }

        Venue::create($validated);

        return redirect()
            ->route('admin.venues.index')
            ->with('success', 'Venue created successfully.');
    }

    public function edit(Venue $venue)
    {
        return Inertia::render('Admin/Venues/Edit', [
            'venue' => $venue
        ]);
    }

    public function update(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short' => 'required|string|max:50|unique:venues,short,' . $venue->id,
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'dimension_m' => 'nullable|numeric|min:0',
            'dimension_f' => 'nullable|numeric|min:0',
            'setup_banquet' => 'nullable|integer|min:0',
            'setup_classroom' => 'nullable|integer|min:0',
            'setup_theater' => 'nullable|integer|min:0',
            'setup_reception' => 'nullable|integer|min:0',
            'floor_plan' => 'nullable|image|mimes:jpeg,png,jpg,gif,pdf|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            if ($venue->getRawOriginal('photo')) {
                Storage::disk('public')->delete($venue->getRawOriginal('photo'));
            }
            $validated['photo'] = $request->file('photo')->store('venues/photos', 'public');
        }

        if ($request->hasFile('floor_plan')) {
            if ($venue->getRawOriginal('floor_plan')) {
                Storage::disk('public')->delete($venue->getRawOriginal('floor_plan'));
            }
            $validated['floor_plan'] = $request->file('floor_plan')->store('venues/floor_plans', 'public');
        }

        $venue->update($validated);

        return redirect()
            ->route('admin.venues.index')
            ->with('success', 'Venue updated successfully.');
    }

    public function destroy(Venue $venue)
    {
        if ($venue->getRawOriginal('photo')) {
            Storage::disk('public')->delete($venue->getRawOriginal('photo'));
        }

        if ($venue->getRawOriginal('floor_plan')) {
            Storage::disk('public')->delete($venue->getRawOriginal('floor_plan'));
        }

        $venue->delete();

        return redirect()
            ->route('admin.venues.index')
            ->with('success', 'Venue deleted successfully.');
    }
}