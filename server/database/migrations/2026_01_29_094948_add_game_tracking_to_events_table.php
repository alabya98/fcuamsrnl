<?php
// server/database/migrations/2026_01_29_000001_add_game_tracking_to_events.php

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
        // Add game tracking fields to events table if they don't exist
        Schema::table('tbl_events', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_events', 'home_team')) {
                $table->string('home_team', 255)->nullable()->after('venue');
            }
            if (!Schema::hasColumn('tbl_events', 'away_team')) {
                $table->string('away_team', 255)->nullable()->after('home_team');
            }
            if (!Schema::hasColumn('tbl_events', 'home_score')) {
                $table->integer('home_score')->nullable()->after('away_team');
            }
            if (!Schema::hasColumn('tbl_events', 'away_score')) {
                $table->integer('away_score')->nullable()->after('home_score');
            }
            if (!Schema::hasColumn('tbl_events', 'winning_team')) {
                $table->enum('winning_team', ['home', 'away', 'draw'])->nullable()->after('away_score');
            }
        });

        // Add athlete_id to records table if it doesn't exist (for better tracking)
        Schema::table('tbl_records', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_records', 'athlete_id')) {
                $table->unsignedBigInteger('athlete_id')->nullable()->after('creator_role');
                $table->foreign('athlete_id')->references('athlete_id')->on('tbl_athletes')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_events', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_events', 'home_team')) {
                $table->dropColumn('home_team');
            }
            if (Schema::hasColumn('tbl_events', 'away_team')) {
                $table->dropColumn('away_team');
            }
            if (Schema::hasColumn('tbl_events', 'home_score')) {
                $table->dropColumn('home_score');
            }
            if (Schema::hasColumn('tbl_events', 'away_score')) {
                $table->dropColumn('away_score');
            }
            if (Schema::hasColumn('tbl_events', 'winning_team')) {
                $table->dropColumn('winning_team');
            }
        });

        Schema::table('tbl_records', function (Blueprint $table) {
            if (Schema::hasColumn('tbl_records', 'athlete_id')) {
                $table->dropForeign(['athlete_id']);
                $table->dropColumn('athlete_id');
            }
        });
    }
};
