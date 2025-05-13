-- Complete setup script for FlipNEWS database
-- This script creates all necessary tables, functions, and policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create news_articles table
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
    tags JSONB DEFAULT '[]'::jsonb,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
    user_id UUID,
    author TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
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

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views table
CREATE TABLE public.views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;

-- Create policies for news_articles
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

-- Create policies for comments
CREATE POLICY "Allow anonymous read access to comments"
    ON public.comments
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated users to insert comments"
    ON public.comments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own comments"
    ON public.comments
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Allow service role full access to comments"
    ON public.comments
    FOR ALL
    TO service_role
    USING (true);

-- Create policies for ads
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

-- Create policies for categories
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

-- Create policies for likes
CREATE POLICY "Allow anonymous read access to likes"
    ON public.likes
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert access to likes"
    ON public.likes
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to likes"
    ON public.likes
    FOR ALL
    TO service_role
    USING (true);

-- Create policies for views
CREATE POLICY "Allow anonymous read access to views"
    ON public.views
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert access to views"
    ON public.views
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to views"
    ON public.views
    FOR ALL
    TO service_role
    USING (true);

-- Add open insert policy for testing
CREATE POLICY "Allow anyone to insert news_articles"
    ON public.news_articles
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anyone to update news_articles"
    ON public.news_articles
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Create function to get service status
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

-- Create function to update bucket policy
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

-- Create pgexecute function
CREATE OR REPLACE FUNCTION pgexecute(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Add a comment to the function to document its purpose and security implications
COMMENT ON FUNCTION pgexecute(text) IS 
'Executes dynamic SQL with superuser privileges. USE WITH EXTREME CAUTION. 
This function should only be used for administrative tasks and should never 
execute user-provided SQL without proper validation.';

-- Create pgexecute_with_result function
CREATE OR REPLACE FUNCTION pgexecute_with_result(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE 'SELECT to_jsonb(t) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE,
    'query', query
  );
END;
$$;

-- Add a comment to the function to document its purpose and security implications
COMMENT ON FUNCTION pgexecute_with_result(text) IS 
'Executes dynamic SQL with superuser privileges and returns the result as JSON. 
USE WITH EXTREME CAUTION. This function should only be used for administrative 
tasks and should never execute user-provided SQL without proper validation.';

-- Create table_exists function
CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = schema_name
    AND tablename = table_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;

-- Create column_exists function
CREATE OR REPLACE FUNCTION column_exists(schema_name text, table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = schema_name
    AND table_name = table_name
    AND column_name = column_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;

-- Create increment_likes function
CREATE OR REPLACE FUNCTION increment_likes(article_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.news_articles
  SET likes = likes + 1
  WHERE id::text = article_id;
END;
$$;

-- Insert default categories
INSERT INTO public.categories (name, slug)
VALUES 
  ('సినిమా', 'cinema'),
  ('రాజకీయం', 'politics'),
  ('క్రీడలు', 'sports'),
  ('వ్యాపారం', 'business'),
  ('టెక్నాలజీ', 'technology'),
  ('ఆరోగ్యం', 'health'),
  ('విద్య', 'education'),
  ('రాష్ట్రీయం', 'state'),
  ('జాతీయం', 'national'),
  ('అంతర్జాతీయం', 'international');

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully.';
END $$;
