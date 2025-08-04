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
    
    // 2. Get filter parameters
    $filterDate = $request->query('filter_date');
    $filterVenue = $request->query('filter_venue');
    $filterStatus = $request->query('filter_status');
    
    // 3. Build month boundaries
    $startOfMonth = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
    $endOfMonth = $startOfMonth->copy()->endOfMonth();
    
    // 4. Fetch venues with short names
    $venues = Venue::select('id', 'name', 'short')->get();
    
    // 5. Build base query for orders with schedules overlapping the month
    $ordersQuery = Order::with(['venues', 'schedules'])
        ->whereHas('schedules', function($query) use ($startOfMonth, $endOfMonth) {
            $query->whereDate('start_date', '<=', $endOfMonth)
                  ->whereDate('end_date', '>=', $startOfMonth);
        });
    
    // 6. Apply filters
    if ($filterDate) {
        $ordersQuery->whereHas('schedules', function($query) use ($filterDate) {
            $query->whereDate('start_date', '<=', $filterDate)
                  ->whereDate('end_date', '>=', $filterDate);
        });
    }
    
    if ($filterVenue) {
        $ordersQuery->whereHas('venues', function($query) use ($filterVenue) {
            $query->where('venues.id', $filterVenue);
        });
    }
    
    if ($filterStatus !== null && $filterStatus !== '') {
        $ordersQuery->where('status', $filterStatus);
    }
    
    $orders = $ordersQuery->get();
    
    // 7. Build per-venue calendar data
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
            // Skip if venue filter is applied and this venue doesn't match
            if ($filterVenue && $venue->id != $filterVenue) {
                continue;
            }
            
            foreach ($order->schedules as $schedule) {
                // Check if schedule overlaps with the target month
                $scheduleStart = \Carbon\Carbon::parse($schedule->start_date)->startOfDay();
                $scheduleEnd = \Carbon\Carbon::parse($schedule->end_date)->startOfDay();
                
                if ($scheduleStart->lte($endOfMonth) && $scheduleEnd->gte($startOfMonth)) {
                    // Apply date filter if specified
                    if ($filterDate) {
                        $filterDateCarbon = \Carbon\Carbon::parse($filterDate);
                        if (!($scheduleStart->lte($filterDateCarbon) && $scheduleEnd->gte($filterDateCarbon))) {
                            continue;
                        }
                    }
                    
                    // Determine if it's a single day or multi-day event
                    $isSingleDay = $scheduleStart->isSameDay($scheduleEnd);
                    
                    // Create display text
                    $displayText = $order->event_name;
                    if ($schedule->function) {
                        $displayText .= ' - ' . $schedule->function;
                    }
                    
                    // Create date range for display
                    $dateRange = $isSingleDay 
                        ? $scheduleStart->format('Y-m-d')
                        : $scheduleStart->format('Y-m-d') . ' to ' . $scheduleEnd->format('Y-m-d');
                    
                    $calendarData[$venue->id]['slots'][] = [
                        'order_id' => $order->id,
                        'schedule_id' => $schedule->id,
                        'event_name' => $order->event_name,
                        'function' => $schedule->function,
                        'display_text' => $displayText,
                        'start' => $scheduleStart->format('Y-m-d'),
                        'end' => $scheduleEnd->format('Y-m-d'),
                        'is_single_day' => $isSingleDay,
                        'date_range' => $dateRange,
                        'status' => $order->status,
                        'date_span' => $this->generateDateSpan($scheduleStart, $scheduleEnd),
                    ];
                }
            }
        }
    }
    
    // 8. Render with Inertia including filter data
    $responseData = [
        'venues' => $venues,
        'calendarData' => $calendarData,
        'month' => $month,
        'year' => $year,
        'filters' => [
            'date' => $filterDate,
            'venue' => $filterVenue ? (int) $filterVenue : null,
            'status' => $filterStatus !== null && $filterStatus !== '' ? (int) $filterStatus : null,
        ],
        'statusOptions' => [
            ['value' => 0, 'label' => 'New Inquiry'],
            ['value' => 1, 'label' => 'Sudah Konfirmasi'],
            ['value' => 2, 'label' => 'Sudah dilaksanakan'],
        ],
    ];
    
    
    
    return Inertia::render('orders/calendar', $responseData);
}

/**
 * Generate array of dates for multi-day events
 */
private function generateDateSpan(\Carbon\Carbon $start, \Carbon\Carbon $end): array
{
    $dates = [];
    $current = $start->copy()->startOfDay();
    $endDate = $end->copy()->startOfDay();
    
    while ($current->lte($endDate)) {
        $dates[] = $current->format('Y-m-d');
        $current->addDay();
    }
    
    return $dates;
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
