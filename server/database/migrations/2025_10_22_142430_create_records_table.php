<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->string('event_name', 255);
            $table->string('competition_level', 100);
            $table->string('sport', 100);
            $table->date('event_date');
            $table->string('venue', 255);
            $table->string('achievement', 100);
            $table->string('athlete_name', 255);
            $table->string('coach_name', 255)->nullable();
            $table->enum('category', ['Team', 'Individual']);
            $table->string('record_type', 100);
            $table->string('points_score', 100)->nullable();
            $table->text('remarks')->nullable();
            $table->year('year');
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_records');
    }
};
