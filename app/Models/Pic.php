<?php
// app/Models/Pic.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pic extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'name',
        'user_id',
        'department_id',
        'phone',
    ];

    /**
     * A PIC belongs to a User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department()
{
    return $this->belongsTo(Department::class);
}

public function beos()
{
    return $this->hasMany(Beo::class);
}

}