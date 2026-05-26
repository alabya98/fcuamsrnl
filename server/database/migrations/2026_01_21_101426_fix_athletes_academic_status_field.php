<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, update existing 'Eligible' and 'Ineligible' statuses to 'Pending Grade Upload'
        DB::table('tbl_athletes')
            ->whereIn('academic_status', ['Eligible', 'Ineligible'])
            ->update(['academic_status' => 'Pending Grade Upload']);

        // Now modify the column to include new enum values
        DB::statement("ALTER TABLE `tbl_athletes`
            MODIFY COLUMN `academic_status`
            ENUM('Eligible', 'Under Review', 'Ineligible', 'Pending Grade Upload')
            DEFAULT 'Pending Grade Upload'");
    }

    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE `tbl_athletes`
            MODIFY COLUMN `academic_status`
            ENUM('Eligible', 'Ineligible')
            DEFAULT 'Eligible'");
    }
};
