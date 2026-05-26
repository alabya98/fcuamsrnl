<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_announcements', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('announcement_id');
            $table->string('creator_role', 50)->nullable()->after('created_by');
            $table->string('target_sport', 100)->nullable()->after('target_audience');

            $table->foreign('created_by')->references('user_id')->on('tbl_users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_announcements', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'creator_role', 'target_sport']);
        });
    }
};
