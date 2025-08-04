<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
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
        'schedules'             => 'required|array|min:1',
        'schedules.*.date'      => 'required|date|after_or_equal:'.$this->order->start_date.'|before_or_equal:'.$this->order->end_date,
        'schedules.*.time_start'=> 'required|date_format:H:i',
        'schedules.*.time_end'  => 'required|date_format:H:i|after:schedules.*.time_start',
        'schedules.*.function'  => 'required|in:1,2,3',
        'schedules.*.setup'     => 'required|string|max:255',
        'schedules.*.people'    => 'required|integer|min:1',
    ];

    }
}
