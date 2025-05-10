-- Create tables for FlipNEWS application

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category_id UUID REFERENCES categories(id),
    image_url TEXT,
    video_url TEXT,
    video_type TEXT,
    author TEXT,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_ip TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table (to track who liked what)
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(news_id, ip_address)
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    video_type TEXT,
    text_content TEXT,
    link_url TEXT,
    frequency INTEGER DEFAULT 3,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stored procedures

-- Increment likes count for an article
CREATE OR REPLACE FUNCTION increment_likes(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles
    SET likes = likes + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Increment views count for an article
CREATE OR REPLACE FUNCTION increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news_articles
    SET views = views + 1
    WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert sample data

-- Insert categories
INSERT INTO categories (name, slug) VALUES
('సినిమా', 'cinema'),
('రాజకీయం', 'politics'),
('క్రీడలు', 'sports'),
('వ్యాపారం', 'business'),
('టెక్నాలజీ', 'technology'),
('ఆరోగ్యం', 'health'),
('విద్య', 'education'),
('రాష్ట్రీయం', 'state'),
('జాతీయం', 'national'),
('అంతర్జాతీయం', 'international')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample news articles
INSERT INTO news_articles (title, content, summary, category_id, image_url, author, created_at)
SELECT
    'ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి చంద్రబాబు నాయుడు కొత్త పథకాలు ప్రకటించారు',
    'ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి చంద్రబాబు నాయుడు రాష్ట్రంలో కొత్త సంక్షేమ పథకాలను ప్రకటించారు. ఈ పథకాల ద్వారా రాష్ట్రంలోని పేద ప్రజలకు ఎంతో మేలు జరుగుతుందని ఆయన అన్నారు. ప్రభుత్వం త్వరలోనే ఈ పథకాలను అమలు చేయనుందని తెలిపారు. ఈ సందర్భంగా ఆయన మాట్లాడుతూ, "మా ప్రభుత్వం ప్రజల సంక్షేమానికి కట్టుబడి ఉంది. ఈ కొత్త పథకాల ద్వారా లక్షలాది మంది ప్రజలకు ఉపయోగం చేకూరుతుంది" అని అన్నారు. ఈ పథకాలపై త్వరలోనే పూర్తి వివరాలు వెల్లడించనున్నట్లు ప్రభుత్వ వర్గాలు తెలిపాయి.',
    'ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి చంద్రబాబు నాయుడు రాష్ట్రంలో కొత్త సంక్షేమ పథకాలను ప్రకటించారు.',
    (SELECT id FROM categories WHERE slug = 'politics'),
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1469&auto=format&fit=crop',
    'రాజేష్ కుమార్',
    NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (
    SELECT 1 FROM news_articles WHERE title = 'ఆంధ్రప్రదేశ్ ముఖ్యమంత్రి చంద్రబాబు నాయుడు కొత్త పథకాలు ప్రకటించారు'
);

INSERT INTO news_articles (title, content, summary, category_id, image_url, author, created_at)
SELECT
    'భారత క్రికెట్ జట్టు వరల్డ్ కప్ గెలుపు - అభిమానుల సంబరాలు',
    'భారత క్రికెట్ జట్టు ప్రపంచ కప్ ఫైనల్లో ఆస్ట్రేలియాను ఓడించి ట్రోఫీని సొంతం చేసుకుంది. ఈ విజయంతో దేశవ్యాప్తంగా అభిమానులు సంబరాలు చేసుకున్నారు. భారత కెప్టెన్ రోహిత్ శర్మ మాట్లాడుతూ, "ఇది జట్టు సామూహిక కృషి ఫలితం. మా అభిమానుల మద్దతు లేకుండా ఇది సాధ్యం కాదు" అని అన్నారు. ఈ విజయంతో భారత్ 12 ఏళ్ల తర్వాత ప్రపంచ కప్ గెలుచుకుంది. ఈ సందర్భంగా ప్రధాని మోదీ క్రికెట్ జట్టుకు అభినందనలు తెలిపారు.',
    'భారత క్రికెట్ జట్టు ప్రపంచ కప్ ఫైనల్లో ఆస్ట్రేలియాను ఓడించి ట్రోఫీని సొంతం చేసుకుంది.',
    (SELECT id FROM categories WHERE slug = 'sports'),
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1494&auto=format&fit=crop',
    'సురేష్ రెడ్డి',
    NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (
    SELECT 1 FROM news_articles WHERE title = 'భారత క్రికెట్ జట్టు వరల్డ్ కప్ గెలుపు - అభిమానుల సంబరాలు'
);

INSERT INTO news_articles (title, content, summary, category_id, image_url, author, created_at)
SELECT
    'తెలంగాణలో భారీ వర్షాలు - ప్రజలకు అప్రమత్త హెచ్చరికలు',
    'తెలంగాణ రాష్ట్రంలో వచ్చే మూడు రోజులు భారీ వర్షాలు కురిసే అవకాశం ఉందని వాతావరణ శాఖ హెచ్చరించింది. ముఖ్యంగా హైదరాబాద్, వరంగల్, నల్గొండ జిల్లాల్లో భారీ నుండి అతి భారీ వర్షాలు కురిసే అవకాశం ఉందని తెలిపింది. ప్రజలు అప్రమత్తంగా ఉండాలని, అత్యవసర పరిస్థితుల్లో 100, 101 నంబర్లకు ఫోన్ చేయాలని అధికారులు సూచించారు. రాష్ట్ర ప్రభుత్వం అన్ని జిల్లాల కలెక్టర్లను అప్రమత్తం చేసింది.',
    'తెలంగాణ రాష్ట్రంలో వచ్చే మూడు రోజులు భారీ వర్షాలు కురిసే అవకాశం ఉందని వాతావరణ శాఖ హెచ్చరించింది.',
    (SELECT id FROM categories WHERE slug = 'state'),
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1470&auto=format&fit=crop',
    'రామకృష్ణ',
    NOW() - INTERVAL '12 hours'
WHERE NOT EXISTS (
    SELECT 1 FROM news_articles WHERE title = 'తెలంగాణలో భారీ వర్షాలు - ప్రజలకు అప్రమత్త హెచ్చరికలు'
);

INSERT INTO news_articles (title, content, summary, category_id, image_url, author, created_at)
SELECT
    'ఆపిల్ కంపెనీ కొత్త ఐఫోన్ మోడల్ విడుదల - ధర, ఫీచర్లు ఇవే',
    'ఆపిల్ కంపెనీ తాజాగా కొత్త ఐఫోన్ మోడల్‌ను విడుదల చేసింది. ఈ కొత్త మోడల్‌లో అత్యాధునిక కెమెరా, వేగవంతమైన ప్రాసెసర్, మెరుగైన బ్యాటరీ లైఫ్ వంటి ఫీచర్లు ఉన్నాయి. ధర రూ. 79,999 నుండి ప్రారంభమవుతుందని కంపెనీ ప్రకటించింది. ఈ నెల 25 నుండి ఆన్‌లైన్ మరియు రిటైల్ స్టోర్లలో లభ్యమవుతుందని తెలిపింది. ఈ కొత్త మోడల్ గురించి టెక్ నిపుణులు పాజిటివ్ రివ్యూలు ఇస్తున్నారు.',
    'ఆపిల్ కంపెనీ తాజాగా కొత్త ఐఫోన్ మోడల్‌ను విడుదల చేసింది. ధర రూ. 79,999 నుండి ప్రారంభమవుతుంది.',
    (SELECT id FROM categories WHERE slug = 'technology'),
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1527&auto=format&fit=crop',
    'కిరణ్ కుమార్',
    NOW() - INTERVAL '6 hours'
WHERE NOT EXISTS (
    SELECT 1 FROM news_articles WHERE title = 'ఆపిల్ కంపెనీ కొత్త ఐఫోన్ మోడల్ విడుదల - ధర, ఫీచర్లు ఇవే'
);

INSERT INTO news_articles (title, content, summary, category_id, image_url, author, created_at)
SELECT
    'పుష్ప-2 సినిమా విడుదల తేదీ ప్రకటించిన అల్లు అర్జున్',
    'అల్లు అర్జున్ నటించిన పుష్ప-2 సినిమా విడుదల తేదీని చిత్ర బృందం ప్రకటించింది. ఈ సినిమా వచ్చే ఏడాది ఆగస్టు 15న విడుదల కానుంది. సుకుమార్ దర్శకత్వంలో తెరకెక్కిన ఈ చిత్రంలో రష్మిక మందన్నా హీరోయిన్‌గా నటిస్తోంది. ఫహద్ ఫాసిల్, జగపతి బాబు ముఖ్య పాత్రలు పోషిస్తున్నారు. పుష్ప-1 సినిమా బాక్సాఫీస్ వద్ద భారీ విజయాన్ని సాధించిన విషయం తెలిసిందే. ఈ సీక్వెల్‌పై అభిమానులు భారీ అంచనాలు పెట్టుకున్నారు.',
    'అల్లు అర్జున్ నటించిన పుష్ప-2 సినిమా వచ్చే ఏడాది ఆగస్టు 15న విడుదల కానుంది.',
    (SELECT id FROM categories WHERE slug = 'cinema'),
    'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=1470&auto=format&fit=crop',
    'వెంకట్',
    NOW() - INTERVAL '3 hours'
WHERE NOT EXISTS (
    SELECT 1 FROM news_articles WHERE title = 'పుష్ప-2 సినిమా విడుదల తేదీ ప్రకటించిన అల్లు అర్జున్'
);

-- Insert sample ads
INSERT INTO ads (title, description, image_url, link_url, frequency)
SELECT
    'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    '/subscribe',
    3
WHERE NOT EXISTS (
    SELECT 1 FROM ads WHERE title = 'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి'
);

INSERT INTO ads (title, description, video_url, video_type, link_url, frequency)
SELECT
    'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'youtube',
    '/smartphone',
    5
WHERE NOT EXISTS (
    SELECT 1 FROM ads WHERE title = 'నూతన స్మార్ట్‌ఫోన్ లాంచ్'
);

-- Insert site settings
INSERT INTO site_settings (key, value)
VALUES
('site_name', 'FlipNEWS'),
('site_description', 'Your source for the latest news in Telugu'),
('items_per_page', '10'),
('enable_comments', 'true'),
('maintenance_mode', 'false')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Set up RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only)
CREATE POLICY "Allow public read access for categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access for published news" ON news_articles
    FOR SELECT USING (published = true);

CREATE POLICY "Allow public read access for approved comments" ON comments
    FOR SELECT USING (approved = true);

CREATE POLICY "Allow public read access for active ads" ON ads
    FOR SELECT USING (active = true);

CREATE POLICY "Allow public read access for site settings" ON site_settings
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to insert comments" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert likes" ON likes
    FOR INSERT WITH CHECK (true);

-- Create policies for service role (admin access)
CREATE POLICY "Allow service role full access to categories" ON categories
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to news_articles" ON news_articles
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to comments" ON comments
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to likes" ON likes
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to ads" ON ads
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to site_settings" ON site_settings
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
