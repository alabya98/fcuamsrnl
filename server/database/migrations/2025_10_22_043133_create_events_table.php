<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_events', function (Blueprint $table) {
            $table->id('event_id');
            $table->string('event_name', 255);
            $table->text('description');
            $table->string('event_type', 100);
            $table->string('sport', 100);
            $table->date('event_date');
            $table->string('start_time', 50);
            $table->string('end_time', 50);
            $table->string('venue', 255);
            $table->string('organizer', 255)->nullable();
            $table->enum('status', ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'])->default('Upcoming');
            $table->integer('max_participants')->nullable();
            $table->date('registration_deadline')->nullable();
            $table->text('notes')->nullable();
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_events');
    }
};
