<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderAttachment extends Model
{
    use SoftDeletes;
    protected $fillable = ['order_id', 'file_name'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
