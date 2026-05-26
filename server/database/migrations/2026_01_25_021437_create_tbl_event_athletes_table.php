<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_event_athletes', function (Blueprint $table) {
            $table->id('event_athlete_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('athlete_id');
            $table->timestamps();

            $table->foreign('event_id')
                ->references('event_id')
                ->on('tbl_events')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('athlete_id')
                ->references('athlete_id')
                ->on('tbl_athletes')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            // Prevent duplicate entries
            $table->unique(['event_id', 'athlete_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_event_athletes');
    }
};
