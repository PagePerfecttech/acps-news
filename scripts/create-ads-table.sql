-- Create ads table for Vizag News project
-- This script creates the ads table with all necessary fields

-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    text_content TEXT,
    image_url TEXT,
    video_url TEXT,
    video_type VARCHAR(50) DEFAULT 'youtube',
    link_url TEXT,
    frequency INTEGER DEFAULT 5,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_frequency ON public.ads(frequency);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies for ads table
-- Allow public read access to active ads
CREATE POLICY "Allow public read access to active ads" ON public.ads
    FOR SELECT USING (active = true);

-- Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all operations for authenticated users" ON public.ads
    FOR ALL USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample ads for testing
INSERT INTO public.ads (title, description, text_content, image_url, link_url, frequency, active) VALUES
('విజయవాడ వ్యాపార ప్రకటన', 'స్థానిక వ్యాపారాల కోసం ప్రకటన', 'మీ వ్యాపారాన్ని ప్రచారం చేయండి విజయవాడలో', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000', 'https://example.com/business', 3, true),
('తెలుగు వార్తల ప్రకటన', 'తాజా తెలుగు వార్తలు', 'రోజువారీ తెలుగు వార్తలు మరియు అప్డేట్లు', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000', 'https://vizag-news.vercel.app', 5, true),
('విజయవాడ ఈవెంట్స్', 'నగరంలో జరుగుతున్న కార్యక్రమాలు', 'విజయవాడలో జరుగుతున్న సాంస్కృతిక మరియు వ్యాపార కార్యక్రమాలు', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000', 'https://example.com/events', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.ads TO authenticated;
GRANT SELECT ON public.ads TO anon;

-- Comments for documentation
COMMENT ON TABLE public.ads IS 'Advertisements table for Vizag News application';
COMMENT ON COLUMN public.ads.title IS 'Advertisement title';
COMMENT ON COLUMN public.ads.description IS 'Short description of the advertisement';
COMMENT ON COLUMN public.ads.text_content IS 'Full text content for text-based ads';
COMMENT ON COLUMN public.ads.image_url IS 'URL for image-based advertisements';
COMMENT ON COLUMN public.ads.video_url IS 'URL for video advertisements (YouTube, etc.)';
COMMENT ON COLUMN public.ads.video_type IS 'Type of video (youtube, mp4, etc.)';
COMMENT ON COLUMN public.ads.link_url IS 'URL to redirect when ad is clicked';
COMMENT ON COLUMN public.ads.frequency IS 'How often this ad should be shown (1-10 scale)';
COMMENT ON COLUMN public.ads.active IS 'Whether this advertisement is currently active';

-- Success message
SELECT 'Ads table created successfully with sample data!' as message;
