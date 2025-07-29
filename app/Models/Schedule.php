<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'start_date',
        'end_date',
        'time_start',
        'time_end',
        'venue_id',
        'function',
        'setup',
        'people',
        'order_id',
    ];

    protected $casts = [
        'start_date'      => 'date',
        'end_date'      => 'date',
        'time_start'      => 'datetime:H:i:s',
        'time_end'      => 'datetime:H:i:s',
        'people'    => 'integer',
    ];

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
