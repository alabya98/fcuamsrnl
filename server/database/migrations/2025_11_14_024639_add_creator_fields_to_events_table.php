<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_events', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('event_id');
            $table->string('creator_role', 50)->nullable()->after('created_by');
            $table->enum('event_scope', ['System-wide', 'Team'])->default('System-wide')->after('creator_role');

            $table->foreign('created_by')->references('user_id')->on('tbl_users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_events', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'creator_role', 'event_scope']);
        });
    }
};
