<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Helpers\OrderStatusHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanitController extends Controller
{
    public function index()
    {
        $orders = Order::with([
            'customer:id,organizer',
            'venues:id,name,short'
        ])->where('status_beo', '!=', 0)->get();

        return Inertia::render('kanit/index', [
            'orders' => $orders,
        ]);
    }

    public function show($id)
    {
        $order = Order::with([
            'customer',
            'venues',
            'schedules' => function ($query) {
                $query->orderBy('start_date')->orderBy('time_start');
            },
            'beos' => function ($query) {
                $query->with(['department', 'package', 'user', 'attachments']);
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
            'notes' => $order->notes ?? '',
            
            // Customer data flattened to order level
            'organizer' => $order->customer->organizer ?? '',
            'address' => $order->customer->address ?? '',
            'contact_person' => $order->customer->contact_person ?? '',
            'phone' => $order->customer->phone ?? '',
            'email' => $order->customer->email ?? '',
            'k_l_status' => $order->customer->k_l_status ?? false,
            
            // Related data
            'customer' => $order->customer,
            'venues' => $order->venues->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'short' => $venue->short ?? '',
                ];
            }),
            
            // Updated schedules structure
            'schedules' => $order->schedules->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'start_date' => $schedule->start_date ? $schedule->start_date->format('Y-m-d') : null,
                    'end_date' => $schedule->end_date ? $schedule->end_date->format('Y-m-d') : null,
                    'time_start' => $schedule->time_start ? $schedule->time_start->format('H:i') : null,
                    'time_end' => $schedule->time_end ? $schedule->time_end->format('H:i') : null,
                    'function' => $schedule->function ?? '',
                    'setup' => $schedule->setup ?? '',
                    'people' => $schedule->people ?? 0,
                    'notes' => $schedule->notes ?? '',
                    // Calculate if it's a single day event
                    'is_single_day' => $schedule->start_date && $schedule->end_date 
                        ? $schedule->start_date->isSameDay($schedule->end_date) 
                        : true,
                    // Create date range string
                    'date_range' => $schedule->start_date && $schedule->end_date
                        ? ($schedule->start_date->isSameDay($schedule->end_date)
                            ? $schedule->start_date->format('Y-m-d')
                            : $schedule->start_date->format('Y-m-d') . ' to ' . $schedule->end_date->format('Y-m-d'))
                        : null,
                ];
            }),
            
            // Updated BEOs structure
            'beos' => $order->beos->map(function ($beo) {
                return [
                    'id' => $beo->id,
                    'notes' => $beo->notes ?? '',
                    'department' => $beo->department ? [
                        'id' => $beo->department->id,
                        'name' => $beo->department->name,
                    ] : null,
                    'package' => $beo->package ? [
                        'id' => $beo->package->id,
                        'name' => $beo->package->name,
                        'description' => $beo->package->description ?? '',
                    ] : null,
                    'user' => $beo->user ? [
                        'id' => $beo->user->id,
                        'name' => $beo->user->name,
                    ] : null,
                    'attachments' => $beo->attachments->map(function ($attachment) {
                        return [
                            'id' => $attachment->id,
                            'file_name' => $attachment->file_name,
                            'created_at' => $attachment->created_at->format('Y-m-d H:i:s'),
                            'url' => '/storage/beo-attachments/' . $attachment->file_name,
                        ];
                    }),
                ];
            }),
            
            // Add status labels for better UI
            'status_label' => $this->getStatusLabel($order->status),
            'beo_status_label' => $this->getBeoStatusLabel($order->status_beo),
        ];

        return Inertia::render('kanit/show', [
            'order' => $transformedOrder,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|integer|in:0,1,2',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $request->status]);

        $statusLabels = [
            0 => 'New Inquiry',
            1 => 'Sudah Konfirmasi', 
            2 => 'Sudah dilaksanakan'
        ];

        return redirect()
            ->route('kanit.dashboard')
            ->with('flash', [
                'message' => "Order #{$order->id} status updated from {$statusLabels[$oldStatus]} to {$statusLabels[$request->status]}."
            ]);
    }

    public function accKanit(Order $order)
    {
        // Direct update without helper
        $order->update(['status_beo' => 2]);

        return redirect()
            ->route('kanit.dashboard')
            ->with('flash', [
                'message' => "Order #{$order->id} has been approved by Kanit and moved to In Progress status."
            ]);
    }

    /**
     * Get status label for order status
     */
    private function getStatusLabel(int $status): string
    {
        return match($status) {
            0 => 'New Inquiry',
            1 => 'Sudah Konfirmasi',
            2 => 'Sudah dilaksanakan',
            default => 'Unknown'
        };
    }

    /**
     * Get BEO status label
     */
    private function getBeoStatusLabel(int $status): string
    {
        return match($status) {
            0 => 'Not Started',
            1 => 'Pending',
            2 => 'In Progress',
            3 => 'Completed',
            4 => 'Approved',
            default => 'Unknown'
        };
    }
}