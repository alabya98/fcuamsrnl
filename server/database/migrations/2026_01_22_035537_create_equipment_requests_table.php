<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_equipment_requests', function (Blueprint $table) {
            $table->id('request_id');
            $table->unsignedBigInteger('coach_id');
            $table->string('sport', 55);
            $table->string('equipment_name', 255);
            $table->integer('quantity_requested');
            $table->text('reason');
            $table->enum('status', ['Pending', 'Approved', 'Rejected'])->default('Pending');
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();

            $table->foreign('coach_id')
                ->references('coach_id')
                ->on('tbl_coaches')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('reviewed_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_equipment_requests');
        Schema::enableForeignKeyConstraints();
    }
};
