<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_eligibility_reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('athlete_id');
            $table->unsignedBigInteger('academic_record_id');
            $table->enum('previous_status', ['Eligible', 'Under Review', 'Ineligible']);
            $table->enum('new_status', ['Eligible', 'Under Review', 'Ineligible']);
            $table->decimal('grade_percentage', 5, 2);
            $table->text('review_reason')->nullable();
            $table->enum('coach_decision', ['approved', 'denied', 'pending'])->default('pending');
            $table->text('coach_notes')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('review_date')->nullable();
            $table->timestamps();

            $table->foreign('athlete_id')
                ->references('athlete_id')
                ->on('tbl_athletes')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('academic_record_id')
                ->references('academic_record_id')
                ->on('tbl_academic_records')
                ->onUpdate('cascade')
                ->onDelete('cascade');

            $table->foreign('reviewed_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->index(['athlete_id', 'coach_decision']);
            $table->index('new_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_eligibility_reviews');
    }
};
