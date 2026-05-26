<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_practice_schedules', function (Blueprint $table) {
            $table->enum('status', ['Pending', 'Approved', 'Declined', 'Completed', 'Cancelled'])
                ->default('Pending')
                ->change();

            $table->text('admin_notes')->nullable()->after('notes');
            $table->unsignedBigInteger('approved_by')->nullable()->after('admin_notes');

            $table->foreign('approved_by')
                ->references('user_id')
                ->on('tbl_users')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_practice_schedules', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['admin_notes', 'approved_by']);

            $table->enum('status', ['Scheduled', 'Completed', 'Cancelled'])
                ->default('Scheduled')
                ->change();
        });
    }
};
