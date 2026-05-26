<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_attendance', function (Blueprint $table) {
            $table->id('attendance_id');
            $table->foreignId('practice_schedule_id')->constrained('tbl_practice_schedules', 'practice_schedule_id')->onDelete('cascade');
            $table->foreignId('athlete_id')->constrained('tbl_athletes', 'athlete_id')->onDelete('cascade');
            $table->enum('status', ['Present', 'Absent', 'Excused', 'Late'])->default('Absent');
            $table->foreignId('marked_by')->constrained('tbl_users', 'user_id')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamp('marked_at')->nullable();
            $table->timestamps();

            // Prevent duplicate attendance entries for same athlete in same practice
            $table->unique(['practice_schedule_id', 'athlete_id'], 'unique_attendance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_attendance');
    }
};
