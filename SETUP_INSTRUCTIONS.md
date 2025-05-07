# FlipNews Setup Instructions

This document provides step-by-step instructions for setting up the FlipNews application with Supabase.

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project
3. Choose a name for your project (e.g., "FlipNews")
4. Set a secure database password
5. Choose a region close to your target audience
6. Click "Create new project"

### Set Up the Database Schema

1. Once your project is created, go to the SQL Editor in the Supabase dashboard
2. Create a new query
3. Copy and paste the contents of the `flipnews_schema.sql` file
4. Run the query to create all the necessary tables and configurations

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to "Project Settings" > "API"
2. Under "Project URL", you'll find your Supabase URL (e.g., `https://yourproject.supabase.co`)
3. Under "Project API keys", copy the "anon" public key

## 3. Configure Environment Variables

### For Local Development

Create a `.env.local` file in the root of your project with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Replace `your_supabase_url` and `your_anon_key` with the values you copied from the Supabase dashboard.

### For Vercel Deployment

1. Go to your Vercel dashboard and select your FlipNews project
2. Go to "Settings" > "Environment Variables"
3. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Click "Save" and redeploy your application

## 4. Enable Authentication (Optional)

If you want to use authentication features:

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Enable the authentication providers you want to use (Email, Google, GitHub, etc.)
3. Configure the providers according to your needs

## 5. Set Up Storage (Optional)

If you want to use Supabase Storage for media uploads:

1. In your Supabase dashboard, go to "Storage"
2. Create the following buckets:
   - `news-images`: for news article images
   - `user-avatars`: for user profile pictures
   - `site-assets`: for site logos and other assets

## 6. Set Up RSS Feeds

You can add RSS feeds to your FlipNews application in two ways:

### Option 1: Using the Admin Dashboard

1. Log in to your FlipNews application as an admin
2. Go to the Admin Dashboard > RSS Feeds
3. Click "Add New Feed"
4. Enter the feed details:
   - Name: A descriptive name for the feed
   - URL: The RSS feed URL
   - Category: The category for articles from this feed (e.g., "General", "Technology", "Sports")
   - Auto Fetch: Enable to automatically fetch new articles
   - Fetch Interval: How often to check for new articles (in minutes)
5. Click "Add Feed"

### Option 2: Using the RSS Feed Manager Script

For easier setup, you can use the provided script to add RSS feeds directly to your database:

1. Install the required dependencies:
   ```
   npm install @supabase/supabase-js dotenv
   ```

2. Make sure your `.env.local` file is set up with your Supabase credentials

3. Run the RSS feed manager script:
   ```
   node add_rss_feed.js
   ```

4. Follow the prompts to add new RSS feeds

### Sample RSS Feeds

Here are some popular RSS feeds you can add:

- **General News**
  - BBC News: `http://feeds.bbci.co.uk/news/rss.xml`
  - CNN: `http://rss.cnn.com/rss/edition.rss`
  - Reuters: `http://feeds.reuters.com/reuters/topNews`

- **Technology**
  - TechCrunch: `https://techcrunch.com/feed/`
  - Wired: `https://www.wired.com/feed/rss`
  - The Verge: `https://www.theverge.com/rss/index.xml`

- **Sports**
  - ESPN: `https://www.espn.com/espn/rss/news`
  - BBC Sport: `http://feeds.bbci.co.uk/sport/rss.xml`
  - Sports Illustrated: `https://www.si.com/rss/si_topstories.rss`

## 7. Troubleshooting

### Database Connection Issues

If you're experiencing database connection issues:

1. Verify that your environment variables are correctly set
2. Check if your Supabase project is active
3. Ensure that your IP is not blocked by Supabase
4. Check the browser console for specific error messages

### RSS Feed Issues

If RSS feeds are not working:

1. Verify that the RSS feed URL is valid and accessible
2. Check if the RSS feed format is supported
3. Ensure that your Supabase database has the `rss_feeds` table
4. Check the browser console for specific error messages

## 8. Additional Configuration

### Site Settings

You can customize your FlipNews application by updating the site settings:

1. Log in to your FlipNews application as an admin
2. Go to the Admin Dashboard > Settings
3. Update the following settings:
   - Site Name: The name of your FlipNews instance
   - Primary Color: The main color used throughout the application
   - Secondary Color: The secondary color used for accents
   - Share Link: The URL used when sharing articles
4. Click "Save Changes"

## 9. Next Steps

After completing the setup:

1. Create categories for your news articles
2. Add RSS feeds to automatically import news
3. Create user accounts for your team members
4. Customize the site settings to match your brand
5. Start publishing news articles

For more information, refer to the FlipNews documentation or contact support.
