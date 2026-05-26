<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_event_coaches', function (Blueprint $table) {
            $table->id('event_coach_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('coach_id');
            $table->timestamps();

            $table->foreign('event_id')
                ->references('event_id')
                ->on('tbl_events')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('coach_id')
                ->references('coach_id')
                ->on('tbl_coaches')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Prevent duplicate entries
            $table->unique(['event_id', 'coach_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_event_coaches');
    }
};
