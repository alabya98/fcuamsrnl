<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_equipment', function (Blueprint $table) {
            $table->id('equipment_id');
            $table->unsignedBigInteger('coach_id');
            $table->string('sport', 55);
            $table->string('equipment_name', 255);
            $table->integer('total_quantity')->default(0);
            $table->integer('available_quantity')->default(0);
            $table->integer('damaged_quantity')->default(0);
            $table->integer('lost_quantity')->default(0);
            $table->enum('condition', ['New', 'Good', 'Fair', 'Poor'])->default('Good');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('last_updated_by');
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();

            $table->foreign('coach_id')
                ->references('coach_id')
                ->on('tbl_coaches')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('last_updated_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_equipment');
        Schema::enableForeignKeyConstraints();
    }
};
