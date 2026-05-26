<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_coaches', function (Blueprint $table) {
            $table->id('coach_id');
            $table->string('staff_id', 55)->unique();
            $table->string('first_name', 55);
            $table->string('middle_name', 55)->nullable();
            $table->string('last_name', 55);
            $table->string('suffix_name', 55)->nullable();
            $table->string('position', 55);
            $table->string('sports_coached', 55);
            $table->string('department', 55);
            $table->string('contact_email', 255);
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_coaches');
    }
};
