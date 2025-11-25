-- Initialize ads table with sample data
-- Run this script to populate the ads table with example advertisements

INSERT INTO ads (id, title, description, link_url, frequency, active, image_url, created_at, updated_at)
VALUES 
    (
        'ad-001',
        'Premium News Subscription',
        'Get unlimited access to all premium content',
        'https://acps-news.vercel.app/subscribe',
        5,
        true,
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
        NOW(),
        NOW()
    ),
    (
        'ad-002',
        'Breaking News Alerts',
        'Never miss important updates with our mobile app',
        'https://acps-news.vercel.app/app',
        3,
        true,
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
        NOW(),
        NOW()
    ),
    (
        'ad-003',
        'Support Quality Journalism',
        'Help us keep news free and independent',
        'https://acps-news.vercel.app/donate',
        7,
        true,
        'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80',
        NOW(),
        NOW()
    ),
    (
        'ad-004',
        'Weekly Newsletter',
        'Get the best stories delivered to your inbox',
        'https://acps-news.vercel.app/newsletter',
        10,
        true,
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;
