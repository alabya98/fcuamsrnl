<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Change academic_status to include 'Under Review'
            $table->enum('academic_status', ['Eligible', 'Under Review', 'Ineligible'])
                ->default('Eligible')
                ->change();

            // Add new academic fields
            $table->decimal('current_grade_percentage', 5, 2)->nullable()->after('academic_status');
            $table->timestamp('last_grade_upload_date')->nullable()->after('current_grade_percentage');
            $table->timestamp('grace_period_start_date')->nullable()->after('last_grade_upload_date');
            $table->timestamp('grace_period_end_date')->nullable()->after('grace_period_start_date');
            $table->text('coach_review_notes')->nullable()->after('grace_period_end_date');
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('coach_review_notes');
            $table->timestamp('review_date')->nullable()->after('reviewed_by');

            // Foreign key for reviewed_by
            $table->foreign('reviewed_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'current_grade_percentage',
                'last_grade_upload_date',
                'grace_period_start_date',
                'grace_period_end_date',
                'coach_review_notes',
                'reviewed_by',
                'review_date'
            ]);

            // Revert academic_status back to original
            $table->enum('academic_status', ['Eligible', 'Ineligible'])
                ->default('Eligible')
                ->change();
        });
    }
};
