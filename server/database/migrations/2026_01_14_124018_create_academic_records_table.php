<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_academic_records', function (Blueprint $table) {
            $table->id('academic_record_id');
            $table->unsignedBigInteger('athlete_id');
            $table->string('semester_term', 100);
            $table->string('grade_image_path', 255);
            $table->json('courses');
            $table->decimal('calculated_percentage', 5, 2);
            $table->decimal('gwa_grade', 4, 2);
            $table->integer('total_units');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->timestamp('verification_date')->nullable();
            $table->text('verification_notes')->nullable();
            $table->timestamp('upload_date')->useCurrent(); // ✅ CHANGED: Added useCurrent()
            $table->timestamps();

            $table->foreign('athlete_id')
                ->references('athlete_id')
                ->on('tbl_athletes')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('verified_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->index(['athlete_id', 'semester_term']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_academic_records');
    }
};
