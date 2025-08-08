<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Event information
            'event_id' => 'required|exists:events,id',
            'event_name' => 'required|string|max:255',
            
            // Date information
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            
            // Venue information
            'venues' => 'required|array|min:1',
            'venues.*' => 'exists:venues,id',
            
            // Customer information
            'customerOption' => 'required|in:new,existing',
            'existing_customer_id' => 'required_if:customerOption,existing|exists:customers,id',
            'discount' => 'nullable|integer|min:0|max:100',
            // New customer data (when customerOption is 'new')
            'customer' => 'required_if:customerOption,new|array',
            'customer.organizer' => 'required_if:customerOption,new|string|max:255',
            'customer.email' => 'nullable|email|max:255',
            'customer.phone' => 'nullable|string|max:20',
            'customer.address' => 'nullable|string|max:500',
            'customer.company' => 'nullable|string|max:255',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'event_id.required' => 'Please select an event type.',
            'event_id.exists' => 'The selected event type is invalid.',
            'event_name.required' => 'Event name is required.',
            'start_date.required' => 'Start date is required.',
            'end_date.required' => 'End date is required.',
            'end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'venues.required' => 'Please select at least one venue.',
            'venues.min' => 'Please select at least one venue.',
            'customerOption.required' => 'Please select customer option.',
            'existing_customer_id.required_if' => 'Please select an existing customer.',
            'customer.required_if' => 'Customer information is required.',
            'customer.organizer.required_if' => 'Organizer name is required.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'event_id' => 'event type',
            'event_name' => 'event name',
            'start_date' => 'start date',
            'end_date' => 'end date',
            'venues' => 'venues',
            'customerOption' => 'customer option',
            'existing_customer_id' => 'existing customer',
            'customer.organizer' => 'organizer name',
            'customer.email' => 'email',
            'customer.phone' => 'phone',
            'customer.address' => 'address',
            'customer.company' => 'company',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert venues to array if it's a string
        if ($this->has('venues') && is_string($this->venues)) {
            $this->merge([
                'venues' => explode(',', $this->venues)
            ]);
        }

        // Ensure event_id is an integer
        if ($this->has('event_id')) {
            $this->merge([
                'event_id' => (int) $this->event_id
            ]);
        }
    }
}