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
        
        -- Make sure RLS is enabled
        ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies to avoid conflicts
        DROP POLICY IF EXISTS "Allow anonymous read access to ads" ON public.ads;
        DROP POLICY IF EXISTS "Allow authenticated read access to all ads" ON public.ads;
        DROP POLICY IF EXISTS "Allow authenticated users to insert ads" ON public.ads;
        DROP POLICY IF EXISTS "Allow authenticated users to update ads" ON public.ads;
        DROP POLICY IF EXISTS "Allow service role full access to ads" ON public.ads;
        
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
            
        RAISE NOTICE 'Updated ads table policies';
    END IF;
END $$;
