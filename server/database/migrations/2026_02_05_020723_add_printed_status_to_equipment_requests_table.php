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
        Schema::table('tbl_equipment_requests', function (Blueprint $table) {
            $table->boolean('is_printed')->default(false)->after('reviewed_at');
            $table->timestamp('printed_at')->nullable()->after('is_printed');
            $table->unsignedBigInteger('printed_by')->nullable()->after('printed_at');

            $table->foreign('printed_by')->references('user_id')->on('tbl_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_equipment_requests', function (Blueprint $table) {
            $table->dropForeign(['printed_by']);
            $table->dropColumn(['is_printed', 'printed_at', 'printed_by']);
        });
    }
};
