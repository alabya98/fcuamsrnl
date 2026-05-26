<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_announcements', function (Blueprint $table) {
            $table->id('announcement_id');
            $table->string('title', 255);
            $table->text('content');
            $table->enum('announcement_type', ['General', 'Event', 'Urgent', 'Reminder'])->default('General');
            $table->enum('target_audience', ['All', 'Athletes', 'Coaches', 'Staff'])->default('All');
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->tinyInteger('is_published')->default(1);
            $table->date('publish_date');
            $table->date('expiry_date')->nullable();
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_announcements');
    }
};
