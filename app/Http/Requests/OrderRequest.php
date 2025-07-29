<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Venues: just an array of IDs
            'venues'               => ['required', 'array', 'min:1'],
            'venues.*'             => ['integer', 'exists:venues,id'],
            
            // Single schedule on the Order itself
            'start_date'           => ['required', 'date'],
            'end_date'             => ['required', 'date', 'after_or_equal:start_date'],
            
            // Customer choice
            'customerOption'       => ['required', 'in:existing,new'],
            'existing_customer_id' => [
                'required_if:customerOption,existing',
                'nullable',
                'exists:customers,id'
            ],
            'event_name'           => ['nullable', 'string'],
            
            // New-customer fields - make required when customerOption is 'new'
            'customer.organizer'      => ['required_if:customerOption,new', 'string', 'max:255'],
            'customer.address'        => ['required_if:customerOption,new', 'string'],
            'customer.contact_person' => ['required_if:customerOption,new', 'string'],
            'customer.phone'          => ['required_if:customerOption,new', 'string'],
            'customer.email'          => ['required_if:customerOption,new', 'email'],
        ];
    }

    public function messages(): array
    {
        return [
            'venues.required'              => 'Please select at least one venue.',
            'end_date.after_or_equal'      => 'End date must be equal to or after start date.',
            'customer.organizer.required_if'    => 'Organizer is required when creating a new customer.',
            'customer.address.required_if'      => 'Address is required when creating a new customer.',
            'customer.contact_person.required_if' => 'Contact person is required when creating a new customer.',
            'customer.phone.required_if'        => 'Phone is required when creating a new customer.',
            'customer.email.required_if'        => 'Email is required when creating a new customer.',
        ];
    }

    protected function prepareForValidation()
    {
        // Convert empty string to null for existing_customer_id when customerOption is 'new'
        if ($this->customerOption === 'new' && $this->existing_customer_id === '') {
            $this->merge([
                'existing_customer_id' => null
            ]);
        }
    }
}