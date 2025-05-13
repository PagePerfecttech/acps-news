-- Sample data for FlipNEWS database
-- This script inserts sample news articles and ads

-- Insert sample news articles
INSERT INTO public.news_articles (title, content, summary, category_id, author, image_url, tags, published)
VALUES 
(
    'ఆంధ్రప్రదేశ్ ఎన్నికల ఫలితాలు: టీడీపీ ఘన విజయం',
    'ఆంధ్రప్రదేశ్ అసెంబ్లీ ఎన్నికల్లో తెలుగుదేశం పార్టీ ఘన విజయం సాధించింది. మొత్తం 175 స్థానాల్లో 150కి పైగా స్థానాల్లో టీడీపీ కూటమి గెలుపొందింది. ఈ ఎన్నికల్లో వైఎస్సార్సీపీ ఓటమి పాలైంది. చంద్రబాబు నాయుడు మరోసారి ముఖ్యమంత్రి అవుతారు.',
    'ఆంధ్రప్రదేశ్ అసెంబ్లీ ఎన్నికల్లో తెలుగుదేశం పార్టీ ఘన విజయం సాధించింది.',
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'రాజేష్ కుమార్',
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1470&auto=format&fit=crop',
    '["ఎన్నికలు", "ఆంధ్రప్రదేశ్", "టీడీపీ"]',
    true
),
(
    'భారత క్రికెట్ జట్టు టీ20 ప్రపంచకప్ గెలుపు',
    'భారత క్రికెట్ జట్టు టీ20 ప్రపంచకప్‌లో ఘన విజయం సాధించింది. ఫైనల్లో దక్షిణాఫ్రికాను ఓడించి ట్రోఫీని సొంతం చేసుకుంది. రోహిత్ శర్మ నాయకత్వంలో భారత జట్టు అద్భుత ప్రదర్శన చేసింది. విరాట్ కోహ్లీ ప్లేయర్ ఆఫ్ ది టోర్నమెంట్‌గా ఎంపికయ్యారు.',
    'భారత క్రికెట్ జట్టు టీ20 ప్రపంచకప్‌లో ఘన విజయం సాధించింది.',
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    'సురేష్ రెడ్డి',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1494&auto=format&fit=crop',
    '["క్రికెట్", "టీ20", "ప్రపంచకప్"]',
    true
),
(
    'నాగార్జున కొత్త సినిమా ప్రారంభం',
    'నటుడు నాగార్జున కొత్త సినిమా ప్రారంభమైంది. ఈ చిత్రానికి ప్రముఖ దర్శకుడు సుకుమార్ దర్శకత్వం వహిస్తున్నారు. ఈ సినిమాలో నాగార్జునతో పాటు బాలీవుడ్ నటి దీపికా పదుకొనే కూడా నటిస్తోంది. ఈ చిత్రం వచ్చే సంవత్సరం సంక్రాంతికి విడుదల కానుంది.',
    'నటుడు నాగార్జున కొత్త సినిమా ప్రారంభమైంది.',
    (SELECT id FROM public.categories WHERE slug = 'cinema'),
    'అనిల్ కుమార్',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1470&auto=format&fit=crop',
    '["సినిమా", "నాగార్జున", "తెలుగు"]',
    true
),
(
    'హైదరాబాద్‌లో కొత్త మెట్రో లైన్ ప్రారంభం',
    'హైదరాబాద్‌లో కొత్త మెట్రో లైన్ ప్రారంభమైంది. ఈ లైన్ ఎల్బీ నగర్ నుండి మియాపూర్ వరకు విస్తరించి ఉంది. ఈ ప్రాజెక్ట్ వల్ల హైదరాబాద్ ట్రాఫిక్ సమస్య చాలా వరకు తగ్గనుంది. ప్రజలకు రవాణా సౌకర్యం మెరుగుపడనుంది.',
    'హైదరాబాద్‌లో కొత్త మెట్రో లైన్ ప్రారంభమైంది.',
    (SELECT id FROM public.categories WHERE slug = 'state'),
    'రమేష్ కుమార్',
    'https://images.unsplash.com/photo-1517239296966-7c6c4f7c0ff5?q=80&w=1470&auto=format&fit=crop',
    '["హైదరాబాద్", "మెట్రో", "రవాణా"]',
    true
),
(
    'ఆపిల్ కొత్త ఐఫోన్ 16 విడుదల',
    'ఆపిల్ కంపెనీ కొత్త ఐఫోన్ 16 సిరీస్‌ను విడుదల చేసింది. ఈ కొత్త ఐఫోన్‌లో ఎఐ ఫీచర్లు, మెరుగైన కెమెరా, పెద్ద బ్యాటరీ ఉన్నాయి. ఈ ఫోన్ ధర రూ. 79,999 నుండి ప్రారంభమవుతుంది. భారత్‌లో ఈ నెల 20 నుండి అమ్మకాలు ప్రారంభం కానున్నాయి.',
    'ఆపిల్ కంపెనీ కొత్త ఐఫోన్ 16 సిరీస్‌ను విడుదల చేసింది.',
    (SELECT id FROM public.categories WHERE slug = 'technology'),
    'కిరణ్ కుమార్',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1470&auto=format&fit=crop',
    '["ఆపిల్", "ఐఫోన్", "టెక్నాలజీ"]',
    true
);

-- Insert sample comments
INSERT INTO public.comments (news_id, author, content)
VALUES 
(
    (SELECT id FROM public.news_articles WHERE title LIKE '%ఎన్నికల ఫలితాలు%' LIMIT 1),
    'రాము',
    'చాలా బాగుంది. టీడీపీ గెలుపు ఆంధ్రప్రదేశ్ అభివృద్ధికి దోహదపడుతుంది.'
),
(
    (SELECT id FROM public.news_articles WHERE title LIKE '%ఎన్నికల ఫలితాలు%' LIMIT 1),
    'సుమన్',
    'ఈసారి చంద్రబాబు నాయుడు మంచి పని చేస్తారని ఆశిస్తున్నాను.'
),
(
    (SELECT id FROM public.news_articles WHERE title LIKE '%క్రికెట్ జట్టు%' LIMIT 1),
    'కిరణ్',
    'భారత జట్టు అద్భుతంగా ఆడింది. రోహిత్ శర్మ నాయకత్వం అద్భుతం.'
),
(
    (SELECT id FROM public.news_articles WHERE title LIKE '%నాగార్జున%' LIMIT 1),
    'సునీత',
    'నాగార్జున సినిమాలు ఎప్పుడూ బాగుంటాయి. ఈ సినిమా కూడా హిట్ అవుతుందని ఆశిస్తున్నాను.'
);

-- Insert sample ads
INSERT INTO public.ads (title, description, image_url, link_url, frequency, active)
VALUES 
(
    'ప్రీమియం సబ్‌స్క్రిప్షన్ - అన్లిమిటెడ్ యాక్సెస్ పొందండి',
    'ఇప్పుడే సబ్‌స్క్రైబ్ చేసుకొని యాడ్-ఫ్రీ రీడింగ్, ఎక్స్‌క్లూజివ్ కంటెంట్ మరియు మరిన్ని ఆనందించండి!',
    'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1470&auto=format&fit=crop',
    '/subscribe',
    3,
    true
),
(
    'నూతన స్మార్ట్‌ఫోన్ లాంచ్',
    'అత్యాధునిక ఫీచర్లతో కొత్త స్మార్ట్‌ఫోన్ మార్కెట్లోకి',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1527&auto=format&fit=crop',
    '/smartphone',
    5,
    true
),
(
    'ఆన్‌లైన్ షాపింగ్ ఆఫర్స్',
    'ఇప్పుడే కొనుగోలు చేసి 50% వరకు పొదుపు చేయండి!',
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop',
    '/shopping',
    4,
    true
);

-- Output success message
DO $$
BEGIN
    RAISE NOTICE 'Sample data inserted successfully.';
END $$;
