<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_records', function (Blueprint $table) {
            $table->unsignedBigInteger('athlete_id')->nullable()->after('record_id');
            $table->foreign('athlete_id')->references('athlete_id')->on('tbl_athletes')->onDelete('cascade');
            $table->index('athlete_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_records', function (Blueprint $table) {
            $table->dropForeign(['athlete_id']);
            $table->dropIndex(['athlete_id']);
            $table->dropColumn('athlete_id');
        });
    }
};
