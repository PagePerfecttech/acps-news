-- Drop all tables script
-- WARNING: This will delete all data in your database
-- Make sure you have a backup if needed

-- Disable triggers temporarily to avoid foreign key constraint issues
SET session_replication_role = 'replica';

-- Drop tables if they exist
DROP TABLE IF EXISTS public.news_articles CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.views CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.article_tags CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.get_service_status();
DROP FUNCTION IF EXISTS public.update_bucket_policy(text, text);
DROP FUNCTION IF EXISTS public.pgexecute(text);
DROP FUNCTION IF EXISTS public.pgexecute_with_result(text);
DROP FUNCTION IF EXISTS public.table_exists(text, text);
DROP FUNCTION IF EXISTS public.column_exists(text, text, text);
DROP FUNCTION IF EXISTS public.increment_likes(text);

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'All tables and functions have been dropped successfully.';
END $$;
