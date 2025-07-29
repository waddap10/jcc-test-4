<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Order;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PicController extends Controller
{
    public function index()
    {
        $currentUserId = Auth::id();

        $orders = Order::with([
            'customer:id,organizer',
            'venues:id,name',
            'beos'
        ])
            ->whereHas('beos', function ($query) use ($currentUserId) {
                $query->where('user_id', $currentUserId);
            })
            ->where('status_beo', 2)
            ->get();

        return Inertia::render('pics/index', [
            'orders' => $orders,
        ]);
    }

    public function show($id)
{
    $currentUserId = Auth::id();
    
    $order = Order::with([
            'customer',
            'venues',
            'schedules' => function ($query) {
                $query->with('venue')->orderBy('start_date')->orderBy('time_start');
            },
            'beos' => function ($query) use ($currentUserId) {
                $query->where('user_id', $currentUserId)
                     ->with(['department', 'user']);
            }
        ])->findOrFail($id);
        
    // Transform the data to match your React component's expected structure
    $transformedOrder = [
        'id' => $order->id,
        'event_name' => $order->event_name,
        'created_at' => $order->created_at,
        'start_date' => $order->start_date,
        'end_date' => $order->end_date,
        'status' => $order->status,
        'status_beo' => $order->status_beo,
       
        // Customer data flattened to order level (as expected by your React component)
        'organizer' => $order->customer->organizer ?? '',
        'address' => $order->customer->address ?? '',
        'contact_person' => $order->customer->contact_person ?? '',
        'phone' => $order->customer->phone ?? '',
        'email' => $order->customer->email ?? '',
       
        // Related data
        'customer' => $order->customer,
        'venues' => $order->venues,
        'schedules' => $order->schedules->map(function ($schedule) {
            return [
                'id' => $schedule->id,
                'start_date' => $schedule->start_date ? $schedule->start_date->format('Y-m-d') : null,
                'end_date' => $schedule->end_date ? $schedule->end_date->format('Y-m-d') : null,
                'time_start' => $schedule->time_start ? $schedule->time_start->format('H:i:s') : null,
                'time_end' => $schedule->time_end ? $schedule->time_end->format('H:i:s') : null,
                'description' => $schedule->function ?? '', // Using function as description
                'function' => $schedule->function,
                'setup' => $schedule->setup,
                'people' => $schedule->people,
                'venue' => $schedule->venue ? [
                    'id' => $schedule->venue->id,
                    'name' => $schedule->venue->name,
                ] : null,
            ];
        }),
        'beos' => $order->beos->map(function ($beo) {
            return [
                'id' => $beo->id,
                'status' => 'pending', // Default status, adjust based on your needs
                'pic' => $beo->user->name ?? '',
                'phone' => $beo->user->phone ?? '', // Add phone field to BEO model if needed
                'description' => $beo->description,
                'department' => [
                    'id' => $beo->department->id,
                    'name' => $beo->department->name,
                ],
                'user' => $beo->user ? [
                    'id' => $beo->user->id,
                    'name' => $beo->user->name,
                ] : null,
            ];
        }),
    ];
    
    return Inertia::render('pics/show', [ // Changed from 'kanit/show' to 'pic/show'
        'order' => $transformedOrder,
    ]);
}
}