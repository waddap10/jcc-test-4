<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Order $order)
    {
        $order->load('schedules.venue');
        return Inertia::render('orders/schedules/index', [
            'order' => $order,
        ]);
    }

    public function create(Order $order)
    {
        // Load only the venues assigned to this order
        $order->load('venues');

        return Inertia::render('orders/schedules/create', [
            'order'  => $order,
            'venues' => $order->venues,
        ]);
    }

    public function store(Request $request, Order $order)
{
    // 1) Validate an array of schedules
    $attrs = $request->validate([
        'schedules'                  => ['required', 'array', 'min:1'],
        'schedules.*.start_date'     => [
            'required',
            'date',
            
        ],
        'schedules.*.end_date'       => [
            'required',
            'date',
            
        ],
        'schedules.*.time_start'     => ['required', 'date_format:H:i'],
        'schedules.*.time_end'       => [
            'required',
            'date_format:H:i',
            'after_or_equal:schedules.*.time_start',
        ],
        'schedules.*.function'       => ['required', 'in:1,2,3'],
        'schedules.*.setup'          => ['nullable', 'string', 'max:255'],
        'schedules.*.people'         => ['required', 'integer', 'min:1'],
    ]);

    // 2) Create them all in one go
    //    `createMany` expects an array of attribute‐arrays
    $order->schedules()->createMany($attrs['schedules']);

    // 3) Redirect with a flash
    return redirect()
        ->route('orders.schedules.index', $order->id)
        ->with('flash', ['message' => 'Schedules added.']);
}
    public function destroy(Order $order, Schedule $schedule): RedirectResponse
    {
        // 1) Ensure the schedule belongs to this order
        abort_if($schedule->order_id !== $order->id, 404);

        // 2) Delete the schedule
        $schedule->delete();

        // 3) Redirect back with a flash message
        return redirect()
            ->route('orders.schedules.index', $order)
            ->with('flash.message', 'Schedule deleted successfully.');
    }

}