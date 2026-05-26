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
        Schema::table('tbl_coaches', function (Blueprint $table) {
            // Add user_id column after coach_id
            $table->unsignedBigInteger('user_id')->nullable()->after('coach_id');

            // Add foreign key constraint
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // Add index for faster lookups
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_coaches', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['user_id']);

            // Drop index
            $table->dropIndex(['user_id']);

            // Drop column
            $table->dropColumn('user_id');
        });
    }
};
