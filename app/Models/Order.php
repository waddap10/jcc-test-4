<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'event_name',
        'start_date',
        'end_date',
        'status',
        'status_beo',
        'customer_id',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function venues()
    {
        return $this->belongsToMany(Venue::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }


    public function beos()
    {
        return $this->hasMany(Beo::class);
    }
}