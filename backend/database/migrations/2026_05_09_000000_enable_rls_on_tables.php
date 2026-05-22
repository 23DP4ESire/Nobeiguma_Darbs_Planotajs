<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * NOTE: This migration enables RLS on PostgreSQL/Supabase only.
     * SQLite does not support RLS, so it will be skipped on local development.
     */
    public function up(): void
    {
        // Only run RLS setup on PostgreSQL (Supabase in production)
        if (DB::getDriverName() !== 'pgsql') {
            // Silently skip on non-PostgreSQL databases
            return;
        }

        // Step 1: Enable RLS on all tables
        $this->enableRLSOnAllTables();

        // Step 2: Drop existing policies to avoid conflicts
        $this->dropExistingPolicies();

        // Step 3: Create policies for user-scoped tables
        $this->createUserPolicies();

        // Step 4: Create policies for system tables (backend access only)
        $this->createSystemTablePolicies();

        // Step 5: Create policies for content tables
        $this->createContentTablePolicies();
    }

    /**
     * Enable RLS on all affected tables
     */
    private function enableRLSOnAllTables(): void
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
            try {
                DB::statement("ALTER TABLE public.{$table} ENABLE ROW LEVEL SECURITY");
            } catch (\Exception $e) {
                // Table might already have RLS enabled, ignore
            }
        }
    }

    /**
     * Drop existing policies to prevent conflicts
     */
    private function dropExistingPolicies(): void
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
            try {
                DB::statement("DROP POLICY IF EXISTS \"Users can view their own profile\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can update their own profile\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can read their password reset tokens\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can delete their password reset tokens\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can view their own sessions\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can delete their own sessions\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can view their own access tokens\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can delete their own access tokens\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Deny public access to {$table}\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Anyone can view services\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can create services\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can edit their own services\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can delete their own services\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Anyone can view works\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can create works\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can edit their own works\" ON public.{$table}");
                DB::statement("DROP POLICY IF EXISTS \"Users can delete their own works\" ON public.{$table}");
            } catch (\Exception $e) {
                // Ignore errors
            }
        }
    }

    /**
     * Create policies for user data (users see/edit only their own data)
     */
    private function createUserPolicies(): void
    {
        // Users table - users can view and update their own profiles
        DB::statement('CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid()::text = id::text)');
        DB::statement('CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id::text)');

        // Password reset tokens - users can access tokens sent to their email
        DB::statement('CREATE POLICY "Users can read their password reset tokens" ON public.password_reset_tokens FOR SELECT USING (auth.email() = email)');
        DB::statement('CREATE POLICY "Users can delete their password reset tokens" ON public.password_reset_tokens FOR DELETE USING (auth.email() = email)');

        // Sessions - users can view and delete their own sessions
        DB::statement('CREATE POLICY "Users can view their own sessions" ON public.sessions FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL)');
        DB::statement('CREATE POLICY "Users can delete their own sessions" ON public.sessions FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL)');

        // Personal access tokens - users can manage their own tokens
        DB::statement('CREATE POLICY "Users can view their own access tokens" ON public.personal_access_tokens FOR SELECT USING (auth.uid()::text = tokenable_id::text)');
        DB::statement('CREATE POLICY "Users can delete their own access tokens" ON public.personal_access_tokens FOR DELETE USING (auth.uid()::text = tokenable_id::text)');
    }

    /**
     * Create policies for system tables
     * These require authenticated access - backend uses service_role which bypasses RLS
     */
    private function createSystemTablePolicies(): void
    {
        // System tables: Only backend service (via service_role) should access these
        // When using service_role, RLS is bypassed, so these policies are for anon users
        $systemTables = ['cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'migrations'];

        foreach ($systemTables as $table) {
            // Deny all access for non-service roles - service_role bypasses this anyway
            DB::statement("CREATE POLICY \"Deny public access to {$table}\" ON public.{$table} USING (false) WITH CHECK (false)");
        }
    }

    /**
     * Create policies for user-generated content
     */
    private function createContentTablePolicies(): void
    {
        // Services - users can read all, but only edit/delete their own
        DB::statement('CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true)');
        DB::statement('CREATE POLICY "Users can create services" ON public.services FOR INSERT WITH CHECK (auth.uid()::text = created_by::text)');
        DB::statement('CREATE POLICY "Users can edit their own services" ON public.services FOR UPDATE USING (auth.uid()::text = created_by::text)');
        DB::statement('CREATE POLICY "Users can delete their own services" ON public.services FOR DELETE USING (auth.uid()::text = created_by::text)');

        // Works - users can read all, but only edit/delete their own
        DB::statement('CREATE POLICY "Anyone can view works" ON public.works FOR SELECT USING (true)');
        DB::statement('CREATE POLICY "Users can create works" ON public.works FOR INSERT WITH CHECK (auth.uid()::text = created_by::text)');
        DB::statement('CREATE POLICY "Users can edit their own works" ON public.works FOR UPDATE USING (auth.uid()::text = created_by::text)');
        DB::statement('CREATE POLICY "Users can delete their own works" ON public.works FOR DELETE USING (auth.uid()::text = created_by::text)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only run on PostgreSQL
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        // Disable RLS and drop all policies
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
            DB::statement("ALTER TABLE public.{$table} DISABLE ROW LEVEL SECURITY");
        }
    }
};
