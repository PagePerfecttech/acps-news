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
        
        -- Make sure the table has all the necessary columns
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'news_articles' 
            AND column_name = 'category_id'
        ) THEN
            ALTER TABLE public.news_articles ADD COLUMN category_id TEXT;
            RAISE NOTICE 'Added category_id column to news_articles table';
        END IF;
        
        -- Make sure RLS is enabled
        ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Allow anonymous read access to news_articles" ON public.news_articles;
        DROP POLICY IF EXISTS "Allow authenticated read access to all news_articles" ON public.news_articles;
        DROP POLICY IF EXISTS "Allow authenticated users to insert news_articles" ON public.news_articles;
        DROP POLICY IF EXISTS "Allow authenticated users to update their own news_articles" ON public.news_articles;
        DROP POLICY IF EXISTS "Allow service role full access to news_articles" ON public.news_articles;
        
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
            
        RAISE NOTICE 'Updated news_articles table policies';
    END IF;
END $$;
