<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $adminExists = DB::table('tbl_users')->where('username', 'admin')->exists();

        if (!$adminExists) {
            // Get Male gender
            $gender = DB::table('tbl_genders')->where('gender', 'Male')->first();

            if (!$gender) {
                $this->command->error('❌ No gender found! Creating genders first...');

                // Create genders if they don't exist
                DB::table('tbl_genders')->insert([
                    ['gender' => 'Male', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
                    ['gender' => 'Female', 'is_deleted' => false, 'created_at' => now(), 'updated_at' => now()],
                ]);

                $gender = DB::table('tbl_genders')->where('gender', 'Male')->first();
            }

            $birthDate = '1990-01-01';
            $age = Carbon::parse($birthDate)->age;

            // Insert admin user directly
            DB::table('tbl_users')->insert([
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'Admin',
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'middle_name' => null,
                'suffix_name' => null,
                'gender_id' => $gender->gender_id,
                'birth_date' => $birthDate,
                'age' => $age,
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->command->info('✅ Admin user created successfully!');
            $this->command->info('   Username: admin');
            $this->command->info('   Password: admin123');
            $this->command->warn('⚠️  Please change the password after first login!');
        } else {
            $this->command->info('ℹ️  Admin user already exists.');
        }
    }
}
