<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->enum('role', ['Admin', 'Coach', 'Athlete'])->default('Athlete')->after('username');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
