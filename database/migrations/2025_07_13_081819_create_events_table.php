<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 50);
            $table->string('code', 10);
            $table->timestamps();

            // Indexes
            $table->index('event_type');
            $table->index('code');
            // Remove the unique constraint if you want multiple events of same type
            // Or keep it if you want only one event per event_type
            $table->unique('event_type'); // Only one event per event_type
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};