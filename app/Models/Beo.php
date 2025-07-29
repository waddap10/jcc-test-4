<?php
// app/Models/Beo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Beo extends Model
{
    protected $fillable = [
        'order_id',
        'department_id',
        'user_id',
        'description',
    ];

    public function order()
{
    return $this->belongsTo(Order::class);
}

public function department()
{
    return $this->belongsTo(Department::class);
}

public function user()
    {
        return $this->belongsTo(User::class);
    }

}
