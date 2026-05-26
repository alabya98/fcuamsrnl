<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->unsignedBigInteger('coach_id')->nullable()->after('user_id');

            $table->foreign('coach_id')
                ->references('coach_id')
                ->on('tbl_coaches')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->dropForeign(['coach_id']);
            $table->dropColumn('coach_id');
        });
    }
};
