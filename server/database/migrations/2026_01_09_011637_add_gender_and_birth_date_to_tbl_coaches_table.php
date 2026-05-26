<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_coaches', function (Blueprint $table) {
            $table->unsignedBigInteger('gender_id')->nullable()->after('suffix_name');
            $table->date('birth_date')->nullable()->after('gender_id');

            $table->foreign('gender_id')->references('gender_id')->on('tbl_genders')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_coaches', function (Blueprint $table) {
            $table->dropForeign(['gender_id']);
            $table->dropColumn(['gender_id', 'birth_date']);
        });
    }
};
