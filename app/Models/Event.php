<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'code'
    ];

    // Define event type codes
    const EVENT_TYPE_CODES = [
        'conference' => 'CNF',
        'workshop' => 'WS',
        'seminar' => 'SEM',
        'webinar' => 'WEB',
        'training' => 'TRN',
        'meeting' => 'MTG',
        'exhibition' => 'EXH',
        'competition' => 'CMP',
        'festival' => 'FST',
        'concert' => 'CNT',
        'sports' => 'SPT',
        'networking' => 'NET'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->code)) {
                $event->code = self::getEventTypeCode($event->event_type);
            }
        });
    }

    /**
     * Get the event type code based on event type
     */
    public static function getEventTypeCode($eventType)
    {
        return self::EVENT_TYPE_CODES[strtolower($eventType)] ?? 'EVT';
    }

    /**
     * Get all available event types
     */
    public static function getEventTypes()
    {
        return array_keys(self::EVENT_TYPE_CODES);
    }

    /**
     * Relationship with orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}