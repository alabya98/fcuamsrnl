<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_athlete_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedBigInteger('athlete_id');
            $table->enum('document_type', ['Parent Consent', 'Medical Record', 'School ID', 'Physical Exam', 'Injury Report', 'Medical Clearance']);
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type'); // mime type
            $table->integer('file_size'); // in bytes
            $table->enum('status', ['Pending Review', 'Approved', 'Rejected'])->default('Pending Review');
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable(); // admin user_id who reviewed
            $table->timestamp('reviewed_at')->nullable();
            $table->date('valid_until')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_visible_to_admin')->default(false); // Privacy flag
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('athlete_id')->references('athlete_id')->on('tbl_athletes')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('user_id')->on('tbl_users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_athlete_documents');
    }
};
