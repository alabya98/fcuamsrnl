<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Add athlete status field (active/inactive)
            $table->enum('athlete_status', ['active', 'inactive'])->default('active')->after('attendance_percentage');

            // Track consecutive absences
            $table->integer('consecutive_absences')->default(0)->after('athlete_status');

            // Optional: Track when athlete became inactive
            $table->timestamp('inactive_since')->nullable()->after('consecutive_absences');

            // Optional: Track who changed the status manually
            $table->foreignId('status_changed_by')->nullable()->constrained('tbl_users', 'user_id')->after('inactive_since');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->dropForeign(['status_changed_by']);
            $table->dropColumn([
                'athlete_status',
                'consecutive_absences',
                'inactive_since',
                'status_changed_by'
            ]);
        });
    }
};
