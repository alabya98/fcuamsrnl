<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Add user_id column after athlete_id
            $table->unsignedBigInteger('user_id')->nullable()->after('athlete_id');

            // Add index for faster lookups
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['user_id']);

            // Drop index
            $table->dropIndex(['user_id']);

            // Drop column
            $table->dropColumn('user_id');
        });
    }
};
