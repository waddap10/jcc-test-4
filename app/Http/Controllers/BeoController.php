<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Beo;
use App\Models\BeoAttachment;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BeoController extends Controller
{
    /**
     * Display a listing of BEOs for an order
     */
    public function index(Order $order)
    {
        $beos = Beo::where('order_id', $order->id)
            ->with(['department', 'package', 'user', 'attachments'])
            ->get();

        return Inertia::render('orders/beos/index', [
            'order' => $order,
            'beos' => $beos
        ]);
    }

    /**
     * Show the form for creating new BEOs
     */
    public function create(Order $order)
    {
        $departments = Department::with(['users', 'packages'])->get();

        return Inertia::render('orders/beos/create', [
            'order' => $order,
            'departments' => $departments
        ]);
    }

    /**
     * Store newly created BEOs
     */
    public function store(Request $request, Order $order)
    {
        $request->validate([
            'entries' => 'required|array',
            'entries.*.department_id' => 'required|exists:departments,id',
            'entries.*.package_id' => 'nullable|exists:packages,id',
            'entries.*.user_id' => 'nullable|exists:users,id',
            'entries.*.notes' => 'nullable|string',
        ]);

        foreach ($request->entries as $index => $entry) {
            $beo = Beo::create([
                'order_id' => $order->id,
                'department_id' => $entry['department_id'],
                'package_id' => $entry['package_id'],
                'user_id' => $entry['user_id'],
                'notes' => $entry['notes'] ?? '',
            ]);

            // Handle new attachments for this BEO
            if ($request->hasFile("new_attachments.$index")) {
                foreach ($request->file("new_attachments.$index") as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->storeAs('beo-attachments', $fileName, 'public');

                    BeoAttachment::create([
                        'beo_id' => $beo->id,
                        'file_name' => $fileName,
                    ]);
                }
            }
        }

         if ($order->status_beo == 2) {
            $order->update(['status_beo' => 3]);
        }

        return redirect()->route('orders.beos.index', $order)
            ->with('message', 'BEO assignments created successfully.');
    }

    /**
     * Show the form for editing BEOs
     */
    public function edit(Order $order)
    {
        $departments = Department::with(['users', 'packages'])->get();
        
        $beos = Beo::where('order_id', $order->id)
            ->with(['department', 'package', 'user', 'attachments'])
            ->get()
            ->map(function ($beo) {
                return [
                    'id' => $beo->id,
                    'department_id' => $beo->department_id,
                    'package_id' => $beo->package_id,
                    'user_id' => $beo->user_id,
                    'notes' => $beo->notes,
                    'existing_attachments' => $beo->attachments->map(function ($attachment) {
                        return [
                            'id' => $attachment->id,
                            'beo_id' => $attachment->beo_id,
                            'file_name' => $attachment->file_name,
                            'created_at' => $attachment->created_at,
                        ];
                    })
                ];
            });

        return Inertia::render('orders/beos/edit', [
            'order' => $order,
            'departments' => $departments,
            'beos' => $beos
        ]);
    }

    /**
     * Update existing BEOs
     */
    public function update(Request $request, Order $order)
    {
        $request->validate([
            'entries' => 'required|array',
            'entries.*.id' => 'required|exists:beos,id',
            'entries.*.department_id' => 'required|exists:departments,id',
            'entries.*.package_id' => 'nullable|exists:packages,id',
            'entries.*.user_id' => 'nullable|exists:users,id',
            'entries.*.notes' => 'nullable|string',
            'delete_attachments' => 'nullable|array',
            'delete_attachments.*' => 'exists:beo_attachments,id',
        ]);

        // Delete marked attachments first
        if ($request->has('delete_attachments') && is_array($request->delete_attachments)) {
            foreach ($request->delete_attachments as $attachmentId) {
                if (!empty($attachmentId)) {
                    $attachment = BeoAttachment::find($attachmentId);
                    if ($attachment) {
                        // Delete file from storage
                        Storage::disk('public')->delete('beo-attachments/' . $attachment->file_name);
                        // Delete record
                        $attachment->delete();
                    }
                }
            }
        }

        // Update each BEO entry
        foreach ($request->entries as $index => $entry) {
            // Skip empty entries
            if (empty($entry['id'])) {
                continue;
            }

            $beo = Beo::findOrFail($entry['id']);
            
            $beo->update([
                'department_id' => !empty($entry['department_id']) ? $entry['department_id'] : null,
                'package_id' => !empty($entry['package_id']) ? $entry['package_id'] : null,
                'user_id' => !empty($entry['user_id']) ? $entry['user_id'] : null,
                'notes' => $entry['notes'] ?? '',
            ]);

            // Handle new attachments for this BEO
            if ($request->hasFile("new_attachments.{$index}")) {
                foreach ($request->file("new_attachments.{$index}") as $file) {
                    $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $file->storeAs('beo-attachments', $fileName, 'public');

                    BeoAttachment::create([
                        'beo_id' => $beo->id,
                        'file_name' => $fileName,
                    ]);
                }
            }
        }

         if ($order->status_beo == 2) {
            $order->update(['status_beo' => 3]);
        }

        return redirect()->route('orders.beos.index', $order)
            ->with('message', 'BEO assignments updated successfully.');
    }

    /**
     * Remove the specified BEO
     */
    public function destroy(Order $order, Beo $beo)
    {
        // Delete all attachments first
        foreach ($beo->attachments as $attachment) {
            Storage::disk('public')->delete('beo-attachments/' . $attachment->file_name);
            $attachment->delete();
        }

        // Delete the BEO
        $beo->delete();
         if ($order->status_beo == 2) {
            $order->update(['status_beo' => 3]);
        }
        return redirect()->route('orders.beos.index', $order)
            ->with('message', 'BEO assignment deleted successfully.');
    }
}