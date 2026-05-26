<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_athletes', function (Blueprint $table) {
            $table->id('athlete_id');
            $table->string('school_id', 55)->unique();
            $table->string('first_name', 55);
            $table->string('middle_name', 55)->nullable();
            $table->string('last_name', 55);
            $table->string('suffix_name', 55)->nullable();
            $table->unsignedBigInteger('gender_id');
            $table->date('birth_date');
            $table->integer('age');
            $table->string('sport', 55);
            $table->string('position', 55);
            $table->string('department', 55);
            $table->tinyInteger('valid_id')->default(0);
            $table->tinyInteger('parent_consent')->default(0);
            $table->enum('academic_status', ['Eligible', 'Ineligible'])->default('Eligible');
            $table->decimal('attendance_percentage', 5, 2)->default(0.00);
            $table->tinyInteger('is_deleted')->default(0);
            $table->timestamps();

            $table->foreign('gender_id')
                ->references('gender_id')
                ->on('tbl_genders')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('tbl_athletes');
        Schema::enableForeignKeyConstraints();
    }
};
