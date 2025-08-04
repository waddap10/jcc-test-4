<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BeoAttachment extends Model
{
    use SoftDeletes;
    protected $fillable = ['beo_id', 'file_name'];

    public function beo()
    {
        return $this->belongsTo(Beo::class);
    }

    // Additional methods or relationships can be defined here
}
