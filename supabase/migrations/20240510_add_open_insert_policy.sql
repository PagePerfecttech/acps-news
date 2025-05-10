-- Add a policy to allow anyone to insert data (for testing purposes)
DROP POLICY IF EXISTS "Allow anyone to insert news_articles" ON public.news_articles;

CREATE POLICY "Allow anyone to insert news_articles"
    ON public.news_articles
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Add a policy to allow anyone to update data (for testing purposes)
DROP POLICY IF EXISTS "Allow anyone to update news_articles" ON public.news_articles;

CREATE POLICY "Allow anyone to update news_articles"
    ON public.news_articles
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
