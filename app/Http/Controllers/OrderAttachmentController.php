<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OrderAttachmentController extends Controller
{
    public function index(Order $order)
    {
        $order->load(['attachments', 'event:id,event_type,code', 'customer:id,organizer']);
        
        return Inertia::render('orders/attachments/index', [
            'order' => $order,
            'attachments' => $order->attachments
        ]);
    }

    public function create(Order $order)
    {
        $order->load(['event:id,event_type,code', 'customer:id,organizer']);
        
        return Inertia::render('orders/attachments/create', [
            'order' => $order
        ]);
    }

    public function store(Request $request, Order $order)
{
    $request->validate([
        'files' => 'required|array|max:5', // Limit to 5 files
        'files.*' => 'required|file|max:5120', // Reduce to 5MB per file
    ]);

    foreach ($request->file('files') as $file) {
        $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
        $file->storeAs('attachments', $fileName, 'public');
        
        OrderAttachment::create([
            'order_id' => $order->id,
            'file_name' => $fileName,
        ]);
    }

    return redirect()
        ->route('orders.attachments.index', $order)
        ->with('flash', ['message' => 'Attachments uploaded successfully.']);
}

    public function destroy(OrderAttachment $attachment)
    {
        Storage::disk('public')->delete('attachments/' . $attachment->file_name);
        $attachment->delete();

        return redirect()
            ->back()
            ->with('flash', ['message' => 'Attachment deleted successfully.']);
    }
}