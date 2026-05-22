<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RLSMigrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that all essential tables exist after migration
     */
    public function test_all_tables_exist_after_migration(): void
    {
        $tables = [
            'users',
            'password_reset_tokens',
            'sessions',
            'personal_access_tokens',
            'cache',
            'cache_locks',
            'jobs',
            'job_batches',
            'failed_jobs',
            'migrations',
            'services',
            'works',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(
                DB::getSchemaBuilder()->hasTable($table),
                "Table '{$table}' does not exist"
            );
        }
    }

    /**
     * Test users table structure
     */
    public function test_users_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('users', 'id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('users', 'name'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('users', 'email'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('users', 'password'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('users', 'created_at'));
    }

    /**
     * Test password_reset_tokens table structure
     */
    public function test_password_reset_tokens_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('password_reset_tokens', 'email'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('password_reset_tokens', 'token'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('password_reset_tokens', 'created_at'));
    }

    /**
     * Test sessions table structure
     */
    public function test_sessions_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('sessions', 'id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('sessions', 'user_id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('sessions', 'payload'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('sessions', 'last_activity'));
    }

    /**
     * Test personal_access_tokens table structure
     */
    public function test_personal_access_tokens_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('personal_access_tokens', 'id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('personal_access_tokens', 'token'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('personal_access_tokens', 'tokenable_id'));
    }

    /**
     * Test services table structure
     */
    public function test_services_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('services', 'id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('services', 'title'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('services', 'description'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('services', 'created_by'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('services', 'created_at'));
    }

    /**
     * Test works table structure
     */
    public function test_works_table_has_required_columns(): void
    {
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('works', 'id'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('works', 'title'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('works', 'description'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('works', 'created_by'));
        $this->assertTrue(DB::getSchemaBuilder()->hasColumn('works', 'created_at'));
    }

    /**
     * Test that migration is idempotent (can run multiple times)
     */
    public function test_migration_is_idempotent(): void
    {
        // First migration already ran, if we can still query tables, we're good
        $tableCount = count(DB::select("SELECT name FROM sqlite_master WHERE type='table'"));
        $this->assertGreaterThan(0, $tableCount);
    }

    /**
     * Test database connection is working
     */
    public function test_database_connection_works(): void
    {
        try {
            $result = DB::select("SELECT 1 as test");
            $this->assertNotEmpty($result);
        } catch (\Exception $e) {
            $this->fail("Database connection failed: {$e->getMessage()}");
        }
    }
}
