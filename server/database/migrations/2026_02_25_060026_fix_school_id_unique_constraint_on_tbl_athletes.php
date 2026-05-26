<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Drop the old simple unique constraint
            $table->dropUnique(['school_id']);
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->unique('school_id');
        });
    }
};
