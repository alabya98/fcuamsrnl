<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_medical_records', function (Blueprint $table) {
            $table->id('medical_record_id');
            $table->unsignedBigInteger('athlete_id');
            $table->date('record_date');
            $table->string('record_type', 100);
            $table->string('diagnosis', 255);
            $table->string('treatment', 255);
            $table->string('prescribed_medication', 255)->nullable();
            $table->string('doctor_name', 255);
            $table->string('hospital_clinic', 255)->nullable();
            $table->text('notes')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->enum('status', ['Active', 'Ongoing', 'Resolved'])->default('Active');
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();

            $table->foreign('athlete_id')
                ->references('athlete_id')
                ->on('tbl_athletes')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_medical_records');
        Schema::enableForeignKeyConstraints();
    }
};
