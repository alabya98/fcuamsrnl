<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_coaches', function (Blueprint $table) {
            $table->dropUnique('tbl_coaches_staff_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_coaches', function (Blueprint $table) {
            $table->unique('staff_id');
        });
    }
};
