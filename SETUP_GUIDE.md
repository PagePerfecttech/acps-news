# FlipNEWS: Complete Setup Guide

This comprehensive guide will walk you through the process of cloning, setting up, and deploying your own version of FlipNEWS - a vertically swipable news portal with admin capabilities.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloning the Repository](#cloning-the-repository)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Storage Setup](#storage-setup)
   - [Cloudinary Setup](#cloudinary-setup)
   - [Cloudflare R2 Setup](#cloudflare-r2-setup)
6. [Local Development](#local-development)
7. [Customization](#customization)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **Git**
- A **Supabase** account (for database and authentication)
- One or more of the following for media storage:
  - A **Cloudinary** account
  - A **Cloudflare** account with R2 access
  - **Supabase Storage** (included with Supabase)
- A **Vercel** account (for deployment)

## Cloning the Repository

1. Open your terminal/command prompt
2. Clone the repository:
   ```bash
   git clone https://github.com/PagePerfecttech/FlipNEWS.git
   cd FlipNEWS
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Create a `.env.local` file in the root directory:
   ```bash
   touch .env.local
   ```

2. Add the following environment variables to your `.env.local` file:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Cloudflare R2 Configuration
   NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
   CLOUDFLARE_R2_BUCKET_NAME=your_r2_bucket_name
   NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=your_r2_public_url
   ```

## Database Configuration

### Setting Up Supabase

1. Create a new project on [Supabase](https://supabase.com/)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Run the following SQL scripts to create the necessary tables:

```sql
-- Create news table
CREATE TABLE public.news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    video_type TEXT,
    author TEXT,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE public.comments (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES public.news(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE public.likes (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES public.news(id) ON DELETE CASCADE,
    user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(news_id, user_id)
);

-- Create categories table
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE public.settings (
    id SERIAL PRIMARY KEY,
    site_name TEXT DEFAULT 'FlipNEWS',
    primary_color TEXT DEFAULT '#FFD700',
    secondary_color TEXT DEFAULT '#FFFFFF',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RSS feeds table
CREATE TABLE public.rss_feeds (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    last_fetched TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE public.ads (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    position TEXT DEFAULT 'inline',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Create the necessary functions for view and like counting:

```sql
-- Function to increment views
CREATE OR REPLACE FUNCTION public.increment_views(news_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.news
  SET views = views + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment likes
CREATE OR REPLACE FUNCTION public.increment_likes(news_id INTEGER, user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  BEGIN
    INSERT INTO public.likes (news_id, user_id)
    VALUES (news_id, user_id);

    UPDATE public.news
    SET likes = likes + 1
    WHERE id = news_id;

    success := true;
  EXCEPTION WHEN unique_violation THEN
    success := false;
  END;

  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

5. Set up Row Level Security (RLS) policies:

```sql
-- Enable RLS on all tables
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ads FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can insert" ON public.comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert" ON public.likes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Storage Setup

You can choose one or more storage providers for your media files. The application will automatically use the configured providers in order of preference.

### Cloudinary Setup

1. Create an account on [Cloudinary](https://cloudinary.com/)
2. Navigate to Dashboard to get your Cloud Name, API Key, and API Secret
3. Add these credentials to your `.env.local` file as shown in the Environment Setup section

### Cloudflare R2 Setup

1. Create a Cloudflare account if you don't have one already
2. Navigate to R2 in the Cloudflare dashboard
3. Create a new R2 bucket for your media files
4. Create API tokens with appropriate permissions:
   - Go to "R2" > "Manage R2 API Tokens"
   - Create a new API token with read and write permissions for your bucket
5. Set up public access for your bucket:
   - Go to your bucket settings
   - Enable "Public Access" and create a public bucket URL
6. Add the following credentials to your `.env.local` file:
   - `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`: Your R2 Access Key ID
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Your R2 Secret Access Key
   - `CLOUDFLARE_R2_BUCKET_NAME`: Your R2 bucket name
   - `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL`: Your R2 public bucket URL

## Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. To access the admin panel, go to `http://localhost:3000/admin`
   - Default login: Create a user in Supabase Authentication and set their role to 'admin' in the users table

## Customization

### Changing the Theme Colors

1. Edit the settings in the admin panel at `/admin/settings`
2. Or directly update the settings table in Supabase

### Adding Categories

1. Go to `/admin/categories` in the admin panel
2. Add new categories as needed

### Configuring RSS Feeds

1. Navigate to `/admin/rss` in the admin panel
2. Add RSS feed URLs to automatically import content

## Deployment

### Deploying to Vercel

1. Push your repository to GitHub
2. Connect your GitHub repository to Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy your project

### Environment Variables for Production

Make sure to add all the environment variables from your `.env.local` file to your Vercel project settings.

## Troubleshooting

### Common Issues

#### Database Connection Issues

- Verify your Supabase URL and anon key are correct
- Check if your IP is allowed in Supabase settings

#### Image Upload Problems

- Ensure storage provider credentials are correct (Cloudinary, R2, or Supabase)
- Check file size limits (default is 5MB for images, 50MB for videos)
- If using Cloudflare R2, ensure public access is enabled for your bucket

#### Build Errors

- Run `npm run build` locally to identify issues
- Check for missing dependencies with `npm install`

#### RSS Feed Import Issues

- Verify the RSS feed URL is valid and accessible
- Check the RSS feed format is compatible

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/PagePerfecttech/FlipNEWS/issues) for similar problems
2. Create a new issue with detailed information about your problem
3. Include error messages, screenshots, and steps to reproduce the issue

---

## Maintenance

### Keeping Up to Date

1. Regularly pull updates from the main repository:
   ```bash
   git remote add upstream https://github.com/PagePerfecttech/FlipNEWS.git
   git fetch upstream
   git merge upstream/master
   ```

2. Update dependencies:
   ```bash
   npm update
   ```

---

This guide should help you set up and customize your own version of FlipNEWS. For more detailed information on specific features, refer to the other documentation files in the repository.
