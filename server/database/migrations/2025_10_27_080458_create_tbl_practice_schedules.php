<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_practice_schedules', function (Blueprint $table) {
            $table->id('practice_schedule_id');
            $table->unsignedBigInteger('coach_id');
            $table->string('venue', 100);
            $table->date('practice_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('total_players');
            $table->string('sport', 55);
            $table->text('notes')->nullable();
            $table->enum('status', ['Scheduled', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();

            $table->foreign('coach_id')
                ->references('coach_id')
                ->on('tbl_coaches')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_practice_schedules');
        Schema::enableForeignKeyConstraints();
    }
};
