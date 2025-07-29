<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with([
            'customer:id,organizer',
            'venues:id,name'
        ])->get();

        return Inertia::render('orders/index', compact('orders'));
    }

    public function create(Request $request)
    {
        // 1. Fetch all venues
        $venues = Venue::select('id', 'name')->get();

        // 2. Fetch ALL existing bookings for ALL venues (not just selected ones)
        // This ensures the React component has all booking data to work with
        $bookings = [];
        $orders = Order::with('venues')->get(['id', 'start_date', 'end_date']);

        foreach ($orders as $order) {
            foreach ($order->venues as $venue) {
                $bookings[] = [
                    'venue_id' => $venue->id,
                    'start_date' => optional($order->start_date)->toDateString(), // Changed from 'start' to 'start_date'
                    'end_date' => optional($order->end_date)->toDateString(),     // Changed from 'end' to 'end_date'
                ];
            }
        }

        // 3. Fetch existing customers (only id & organizer)
        $customers = Customer::select('id', 'organizer')->get();

        // 4. Render Inertia page with venues, bookings, customers & flash
        return Inertia::render('orders/create', [
            'venues' => $venues,
            'bookings' => $bookings,
            'customers' => $customers,
            'flash' => session('flash', []),
        ]);
    }

    public function store(OrderRequest $request)
{
    $data = $request->validated();
    
    // 1) Resolve customer ID
    if ($data['customerOption'] === 'new') {
        $custId = Customer::create($data['customer'])->id;
    } else {
        $custId = $data['existing_customer_id'];
    }
    
    // 2) Create the Order (single start/end on the order)
    $order = Order::create([
        'event_name' => $data['event_name'] ?? '—',
        'customer_id' => $custId,
        'status' => 0,
        'start_date' => $data['start_date'],
        'end_date' => $data['end_date'],
    ]);
    
    // 3) Attach venues (only order_id + venue_id)
    // Using sync() so you don't create duplicates if you revisit the form
    $order->venues()->sync($data['venues']);
    
    return redirect()
        ->route('orders.index')
        ->with('flash', ['message' => 'Order created successfully.']);
}

    public function destroy(Order $order)
    {
        DB::transaction(function () use ($order) {
            $order->venues()->detach();
            $order->delete();
        });

        return redirect()
            ->route('orders.index')
            ->with('flash', ['message' => 'Reservation deleted successfully.']);
    }



    public function calendar(Request $request)
    {
        // 1. Determine target month/year
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        // 2. Build month boundaries
        $startOfMonth = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        // 3. Fetch venues
        $venues = Venue::select('id', 'name')->get();

        // 4. Fetch orders overlapping the month
        $orders = Order::with('venues')
            ->whereDate('start_date', '<=', $endOfMonth)
            ->whereDate('end_date', '>=', $startOfMonth)
            ->get();

        // 5. Build per-venue calendar data
        $calendarData = $venues
            ->keyBy('id')
            ->map(function ($venue) {
                return [
                    'name' => $venue->name,
                    'slots' => [],
                ];
            })
            ->toArray();

        foreach ($orders as $order) {
            foreach ($order->venues as $venue) {
                $calendarData[$venue->id]['slots'][] = [
                    'order_id' => $order->id,
                    'event_name' => $order->event_name,
                    'start' => $order->start_date,
                    'end' => $order->end_date,
                    'status' => $order->status,
                ];
            }
        }

        // 6. Render with Inertia
        return Inertia::render('orders/calendar', [
            'venues' => $venues,
            'calendarData' => $calendarData,
            'month' => $month,
            'year' => $year,
        ]);
    }

    public function updateStatus(Order $order)
    {
        $order->update(['status' => 1]);

        return redirect()
            ->route('orders.index')
            ->with('flash', ['message' => "Order #{$order->id} status confirm."]);
    }

    public function accKanit(Order $order)
    {
        $order->update(['status_beo' => 1]);

        return redirect()
            ->route('orders.index')
            ->with('flash', ['message' => "Order #{$order->id} status Terkirim ke Kanit."]);
    }

    public function markSelesai(Order $order)
{
    // Validate that the order can be marked as selesai
    // Only allow if status_beo is 2 (Sudah Acc Kanit)
    if ($order->status_beo !== 2) {
        return redirect()
            ->back()
            ->with('flash', ['error' => 'Order cannot be marked as completed. BEO must be approved by Kanit first.']);
    }
    
    // Prevent marking as selesai if already completed
    if ($order->status === 2) {
        return redirect()
            ->back()
            ->with('flash', ['error' => 'Order is already marked as completed.']);
    }
    
    // Update the order status to 2 (Sudah dilaksanakan)
    $order->update([
        'status' => 2
    ]);
    
    return redirect()
        ->route('orders.index')
        ->with('flash', ['message' => "Order #{$order->id} has been marked as completed."]);
}



}
