<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_sports', function (Blueprint $table) {
            $table->id('sport_id');
            $table->string('sport', 55);
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_sports');
        Schema::enableForeignKeyConstraints();
    }
};
