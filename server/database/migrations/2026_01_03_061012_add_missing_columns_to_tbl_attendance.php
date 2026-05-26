<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_attendance', function (Blueprint $table) {
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('tbl_attendance', 'is_submitted')) {
                $table->boolean('is_submitted')->default(false)->after('marked_at');
            }

            if (!Schema::hasColumn('tbl_attendance', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('is_submitted');
            }
        });
    }

    public function down(): void
    {
        Schema::table('tbl_attendance', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_attendance', 'is_submitted')) {
                $table->dropColumn('is_submitted');
            }

            if (Schema::hasColumn('tbl_attendance', 'submitted_at')) {
                $table->dropColumn('submitted_at');
            }
        });
    }
};
