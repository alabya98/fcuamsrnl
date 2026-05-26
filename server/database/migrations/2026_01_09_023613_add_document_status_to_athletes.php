<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            // Add columns for document upload status tracking
            $table->boolean('has_parent_consent_file')->default(false)->after('parent_consent');
            $table->boolean('has_valid_id_file')->default(false)->after('valid_id');
            $table->integer('medical_documents_count')->default(0)->after('has_valid_id_file');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_athletes', function (Blueprint $table) {
            $table->dropColumn(['has_parent_consent_file', 'has_valid_id_file', 'medical_documents_count']);
        });
    }
};
