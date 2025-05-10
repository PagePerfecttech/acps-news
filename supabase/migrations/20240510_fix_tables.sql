-- This script is designed to fix the missing tables in your Supabase database
-- It will create the necessary tables and add default data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create site_settings table
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'site_settings'
    ) THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.site_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            key TEXT NOT NULL UNIQUE,
            value JSONB NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add index on key for faster lookups
        CREATE INDEX idx_site_settings_key ON public.site_settings(key);
        
        -- Enable RLS
        ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow anonymous read access to site_settings"
            ON public.site_settings
            FOR SELECT
            TO anon
            USING (true);
            
        CREATE POLICY "Allow authenticated read access to site_settings"
            ON public.site_settings
            FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Allow service role full access to site_settings"
            ON public.site_settings
            FOR ALL
            TO service_role
            USING (true);
            
        -- Insert default settings
        INSERT INTO public.site_settings (key, value, description)
        VALUES
            ('app_name', '"FlipNEWS"', 'Application name'),
            ('app_description', '"FlipNEWS is your source for the latest Telugu news with an interactive flip experience"', 'Application description'),
            ('theme_primary_color', '"#FFCC00"', 'Primary theme color'),
            ('theme_secondary_color', '"#333333"', 'Secondary theme color'),
            ('max_articles_per_page', '10', 'Maximum number of articles to show per page'),
            ('enable_comments', 'true', 'Whether to enable comments on articles'),
            ('enable_likes', 'true', 'Whether to enable likes on articles'),
            ('enable_sharing', 'true', 'Whether to enable sharing of articles'),
            ('maintenance_mode', 'false', 'Whether the site is in maintenance mode'),
            ('version', '"1.0.0"', 'Application version');
            
        RAISE NOTICE 'Created site_settings table and inserted default data';
    ELSE
        RAISE NOTICE 'site_settings table already exists';
    END IF;
END $$;

-- Create ads table
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
            image_url TEXT,
            video_url TEXT,
            video_type TEXT,
            text_content TEXT,
            link_url TEXT,
            frequency INTEGER DEFAULT 5,
            active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Allow anonymous read access to active ads"
            ON public.ads
            FOR SELECT
            TO anon
            USING (active = true);
            
        CREATE POLICY "Allow authenticated read access to all ads"
            ON public.ads
            FOR SELECT
            TO authenticated
            USING (true);
            
        CREATE POLICY "Allow service role full access to ads"
            ON public.ads
            FOR ALL
            TO service_role
            USING (true);
            
        -- Insert default ads
        INSERT INTO public.ads (title, description, image_url, link_url, active)
        VALUES
            ('FlipNEWS Premium', 'Get unlimited access to all articles and features', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1470&auto=format&fit=crop', 'https://flip-news.vercel.app/premium', true),
            ('Download Our App', 'Get the latest news on your mobile device', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/app', true),
            ('Subscribe to Newsletter', 'Stay updated with our weekly newsletter', 'https://images.unsplash.com/photo-1583912086096-8c60d75a13f5?q=80&w=1374&auto=format&fit=crop', 'https://flip-news.vercel.app/newsletter', true);
            
        RAISE NOTICE 'Created ads table and inserted default data';
    ELSE
        RAISE NOTICE 'ads table already exists';
    END IF;
END $$;
