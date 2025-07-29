<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(): Response
    {
        $customers = Customer::withCount('orders')
            ->orderBy('created_at', 'desc')
            ->get(); // Changed from paginate() to get()

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'flash' => session('flash', []), // Add flash messages
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        return Inertia::render('customers/create');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'organizer' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:customers,email',
        ]);

        Customer::create($validated);

        return redirect()
            ->route('customers.index')
            ->with('flash', ['message' => 'Customer created successfully.']);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        $customer->load(['orders' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('customers/show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('customers/edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'organizer' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
        ]);

        $customer->update($validated);

        return redirect()
            ->route('customers.index')
            ->with('flash', ['message' => 'Customer updated successfully.']);
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer)
    {
        // Check if customer has orders
        if ($customer->orders()->count() > 0) {
            return redirect()
                ->back()
                ->with('flash', ['error' => 'Cannot delete customer with existing orders.']);
        }

        $customer->delete();

        return redirect()
            ->route('customers.index')
            ->with('flash', ['message' => 'Customer deleted successfully.']);
    }
}