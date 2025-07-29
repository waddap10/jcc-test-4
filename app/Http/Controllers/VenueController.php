<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VenueController extends Controller
{
    /**
     * Display a listing of venues.
     */
    public function index(): Response
    {
        $venues = Venue::orderBy('created_at', 'desc')
            ->get(); // Changed from paginate() to get()

        return Inertia::render('venues/index', [
            'venues' => $venues,
            'flash' => session('flash', []), // Add flash messages
        ]);
    }

    /**
     * Show the form for creating a new venue.
     */
    public function create(): Response
    {
        return Inertia::render('venues/create');
    }

    /**
     * Store a newly created venue in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
            'dimension_m' => 'nullable|numeric|min:0',
            'dimension_f' => 'nullable|numeric|min:0',
            'setup_banquet' => 'nullable|integer|min:0',
            'setup_classroom' => 'nullable|integer|min:0',
            'setup_theater' => 'nullable|integer|min:0',
            'setup_reception' => 'nullable|integer|min:0',
            'floor_plan' => 'nullable|image|max:2048',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('venues/photos', 'public');
        }

        // Handle floor plan upload
        if ($request->hasFile('floor_plan')) {
            $validated['floor_plan'] = $request->file('floor_plan')->store('venues/floor-plans', 'public');
        }

        Venue::create($validated);

        return redirect()
            ->route('venues.index')
            ->with('flash', ['message' => 'Venue created successfully.']);
    }

    /**
     * Display the specified venue.
     */
    public function show(Venue $venue): Response
    {
        return Inertia::render('venues/show', [
            'venue' => $venue,
        ]);
    }

    /**
     * Show the form for editing the specified venue.
     */
    public function edit(Venue $venue): Response
    {
        return Inertia::render('venues/edit', [
            'venue' => $venue,
        ]);
    }

    /**
     * Update the specified venue in storage.
     */
    public function update(Request $request, Venue $venue)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
            'dimension_m' => 'nullable|numeric|min:0',
            'dimension_f' => 'nullable|numeric|min:0',
            'setup_banquet' => 'nullable|integer|min:0',
            'setup_classroom' => 'nullable|integer|min:0',
            'setup_theater' => 'nullable|integer|min:0',
            'setup_reception' => 'nullable|integer|min:0',
            'floor_plan' => 'nullable|image|max:2048',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($venue->getRawOriginal('photo')) {
                Storage::disk('public')->delete($venue->getRawOriginal('photo'));
            }
            $validated['photo'] = $request->file('photo')->store('venues/photos', 'public');
        }

        // Handle floor plan upload
        if ($request->hasFile('floor_plan')) {
            // Delete old floor plan if exists
            if ($venue->getRawOriginal('floor_plan')) {
                Storage::disk('public')->delete($venue->getRawOriginal('floor_plan'));
            }
            $validated['floor_plan'] = $request->file('floor_plan')->store('venues/floor-plans', 'public');
        }

        $venue->update($validated);

        return redirect()
            ->route('venues.index')
            ->with('flash', ['message' => 'Venue updated successfully.']);
    }

    /**
     * Remove the specified venue from storage.
     */
    public function destroy(Venue $venue)
    {
        // Check if venue has orders (you'll need to implement this relationship)
        // if ($venue->orders()->count() > 0) {
        //     return redirect()
        //         ->back()
        //         ->with('flash', ['error' => 'Cannot delete venue with existing orders.']);
        // }

        // Delete associated files
        if ($venue->getRawOriginal('photo')) {
            Storage::disk('public')->delete($venue->getRawOriginal('photo'));
        }
        if ($venue->getRawOriginal('floor_plan')) {
            Storage::disk('public')->delete($venue->getRawOriginal('floor_plan'));
        }

        $venue->delete();

        return redirect()
            ->route('venues.index')
            ->with('flash', ['message' => 'Venue deleted successfully.']);
    }
}