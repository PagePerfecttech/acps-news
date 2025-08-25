-- Sample Data for ACPS News
-- Run this AFTER the main database setup

-- Add sample reporters/users
INSERT INTO users (email, name, role, active) VALUES
  ('reporter1@acpsnews.com', 'John Smith', 'reporter', true),
  ('reporter2@acpsnews.com', 'Sarah Johnson', 'reporter', true),
  ('editor@acpsnews.com', 'Mike Wilson', 'editor', true),
  ('sports@acpsnews.com', 'Alex Rodriguez', 'reporter', true),
  ('education@acpsnews.com', 'Dr. Emily Davis', 'reporter', true)
ON CONFLICT (email) DO NOTHING;

-- Add sample news articles
INSERT INTO news_articles (title, content, summary, category_id, author, published) VALUES
  (
    'Welcome to ACPS News',
    'We are excited to launch ACPS News, your premier source for educational and community updates. Our platform brings you the latest news, events, and announcements from the academic community.',
    'Introducing ACPS News - your source for educational and community updates.',
    (SELECT id FROM categories WHERE slug = 'announcements'),
    'ACPS Admin',
    true
  ),
  (
    'New Technology Lab Opens',
    'The state-of-the-art technology lab has officially opened its doors to students. Featuring the latest computers, 3D printers, and robotics equipment, this facility will enhance our STEM education programs.',
    'New technology lab opens with cutting-edge equipment for STEM education.',
    (SELECT id FROM categories WHERE slug = 'education'),
    'Dr. Emily Davis',
    true
  ),
  (
    'Annual Sports Day Scheduled',
    'Mark your calendars! The annual sports day is scheduled for next month. Students from all grades will participate in various athletic events including track and field, basketball, and soccer.',
    'Annual sports day announced with events for all grade levels.',
    (SELECT id FROM categories WHERE slug = 'sports'),
    'Alex Rodriguez',
    true
  ),
  (
    'Community Health Fair',
    'Join us for the community health fair featuring free health screenings, vaccination drives, and wellness workshops. Healthcare professionals will be available to answer questions and provide guidance.',
    'Community health fair offers free screenings and wellness workshops.',
    (SELECT id FROM categories WHERE slug = 'health'),
    'Sarah Johnson',
    true
  )
ON CONFLICT DO NOTHING;

-- Add sample RSS feeds
INSERT INTO rss_feeds (name, url, category_id, active) VALUES
  (
    'Education News',
    'https://www.edweek.org/feeds/all.rss',
    (SELECT id FROM categories WHERE slug = 'education'),
    true
  ),
  (
    'Sports Updates',
    'https://www.espn.com/espn/rss/news',
    (SELECT id FROM categories WHERE slug = 'sports'),
    true
  ),
  (
    'Health News',
    'https://www.cdc.gov/rss/health.xml',
    (SELECT id FROM categories WHERE slug = 'health'),
    true
  )
ON CONFLICT (url) DO NOTHING;

-- Add sample ads
INSERT INTO ads (title, description, text_content, link_url, frequency, active) VALUES
  (
    'ACPS Library Services',
    'Discover our extensive library resources',
    'Visit the ACPS Library for books, digital resources, and study spaces. Open Monday-Friday 8AM-6PM.',
    'https://library.acps.edu',
    5,
    true
  ),
  (
    'Student Support Services',
    'Academic and personal support for all students',
    'Need help with academics or personal challenges? Our support services are here for you. Contact us today.',
    'https://support.acps.edu',
    3,
    true
  ),
  (
    'ACPS Events Calendar',
    'Stay updated with upcoming events',
    'Never miss an important event! Check our calendar for meetings, sports, performances, and more.',
    'https://calendar.acps.edu',
    4,
    true
  )
ON CONFLICT DO NOTHING;
