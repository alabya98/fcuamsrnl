<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Drop old boolean columns
            $table->dropColumn(['valid_id', 'parent_consent']);
        });

        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Add new string columns
            $table->string('valid_id', 50)->default('Not Submitted')->after('department');
            $table->string('parent_consent', 50)->default('Not Submitted')->after('valid_id');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->dropColumn(['valid_id', 'parent_consent']);
        });

        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->boolean('valid_id')->default(false);
            $table->boolean('parent_consent')->default(false);
        });
    }
};
