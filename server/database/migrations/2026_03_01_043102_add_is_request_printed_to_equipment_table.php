<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_equipment', function (Blueprint $table) {
            $table->boolean('is_request_printed')->default(false)->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_equipment', function (Blueprint $table) {
            $table->dropColumn('is_request_printed');
        });
    }
};
