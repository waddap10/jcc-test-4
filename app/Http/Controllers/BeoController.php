<?php

namespace App\Http\Controllers;

use App\Models\Beo;
use App\Models\Department;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BeoController extends Controller
{
    public function index(Order $order)
    {
        $beos = $order->beos()
            ->with(['department', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('orders/beos/index', [
            'order' => $order->load('customer'),
            'beos' => $beos,
            'departments' => Department::all(),
        ]);
    }

    public function create(Order $order)
    {
        // eager-load pics so form can filter by department
        $departments = Department::with('users')->get();

        return Inertia::render('orders/beos/create', [
            'order' => $order,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request, Order $order)
{
    $validated = $request->validate([
        'entries'                        => 'required|array',
        'entries.*.department_id'        => 'required|exists:departments,id',
        'entries.*.user_id'              => 'required|exists:users,id',
        'entries.*.description'          => 'nullable|string',
    ]);

    foreach ($validated['entries'] as $entry) {
        Beo::create([
            'order_id'      => $order->id,
            'department_id' => $entry['department_id'],
            'user_id'       => $entry['user_id'],
            'description'   => $entry['description'] ?? null,
        ]);
    }

    return redirect()
        ->route('orders.beos.index', $order->id)
        ->with('message', 'Assignments saved.');
}

}