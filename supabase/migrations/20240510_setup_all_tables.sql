-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_articles table if it doesn't exist
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'news_articles'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.news_articles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            category_id TEXT,
            author TEXT,
            image_url TEXT,
            video_url TEXT,
            video_type TEXT,
            tags JSONB,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            published BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow anonymous read access to news_articles"
            ON public.news_articles
            FOR SELECT
            TO anon
            USING (published = true);
            
        CREATE POLICY "Allow authenticated read access to all news_articles"
            ON public.news_articles
            FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to insert news_articles"
            ON public.news_articles
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to update their own news_articles"
            ON public.news_articles
            FOR UPDATE
            TO authenticated
            USING (auth.uid()::text = author)
            WITH CHECK (auth.uid()::text = author);
            
        CREATE POLICY "Allow service role full access to news_articles"
            ON public.news_articles
            FOR ALL
            TO service_role
            USING (true);
            
        RAISE NOTICE 'Created news_articles table and policies';
    ELSE
        RAISE NOTICE 'news_articles table already exists';
    END IF;
END $$;

-- Create ads table if it doesn't exist
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'ads'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.ads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            text_content TEXT,
            image_url TEXT,
            video_url TEXT,
            video_type TEXT,
            link_url TEXT,
            frequency INTEGER DEFAULT 5,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow anonymous read access to ads"
            ON public.ads
            FOR SELECT
            TO anon
            USING (active = true);
            
        CREATE POLICY "Allow authenticated read access to all ads"
            ON public.ads
            FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to insert ads"
            ON public.ads
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to update ads"
            ON public.ads
            FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow service role full access to ads"
            ON public.ads
            FOR ALL
            TO service_role
            USING (true);
            
        RAISE NOTICE 'Created ads table and policies';
    ELSE
        RAISE NOTICE 'ads table already exists';
    END IF;
END $$;

-- Create categories table if it doesn't exist
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'categories'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.categories (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow anonymous read access to categories"
            ON public.categories
            FOR SELECT
            TO anon
            USING (true);
            
        CREATE POLICY "Allow authenticated read access to all categories"
            ON public.categories
            FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Allow authenticated users to insert categories"
            ON public.categories
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
            
        CREATE POLICY "Allow authenticated users to update categories"
            ON public.categories
            FOR UPDATE
            TO authenticated
            USING (true)
            WITH CHECK (true);
            
        CREATE POLICY "Allow service role full access to categories"
            ON public.categories
            FOR ALL
            TO service_role
            USING (true);
            
        RAISE NOTICE 'Created categories table and policies';
    ELSE
        RAISE NOTICE 'categories table already exists';
    END IF;
END $$;

-- Add open insert policy for testing
DROP POLICY IF EXISTS "Allow anyone to insert news_articles" ON public.news_articles;
CREATE POLICY "Allow anyone to insert news_articles"
    ON public.news_articles
    FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anyone to update news_articles" ON public.news_articles;
CREATE POLICY "Allow anyone to update news_articles"
    ON public.news_articles
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Function to update bucket policy
CREATE OR REPLACE FUNCTION update_bucket_policy(bucket_name TEXT, policy TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is a placeholder since we can't directly modify bucket policies from SQL
  -- The actual policy changes need to be done through the Supabase dashboard or API
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'This is a placeholder function. Please update bucket policies through the Supabase dashboard.',
    'bucket', bucket_name,
    'policy', policy
  );
END;
$$;

-- Function to get service status
CREATE OR REPLACE FUNCTION get_service_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'online',
    'timestamp', NOW(),
    'version', '1.0.0'
  );
END;
$$;
