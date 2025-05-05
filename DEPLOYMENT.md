# FlipNews Deployment Guide

This guide will help you deploy the FlipNews application to Vercel with a Supabase database.

## Prerequisites

- A Vercel account (https://vercel.com)
- A Supabase account (https://supabase.com)
- Git repository with your FlipNews code

## Step 1: Set up Supabase

1. Log in to your Supabase account
2. Click "New Project"
3. Fill in the project details:
   - Name: FlipNews
   - Database Password: CTP7oKcNhXD88Cwb (or your preferred password)
   - Region: Mumbai (or your preferred region)
4. Click "Create new project" and wait for it to be created

## Step 2: Set up the database

1. In your Supabase project, go to the "SQL Editor" section
2. Click "New Query"
3. Copy and paste the contents of the `supabase/schema.sql` file
4. Run the query to create all the necessary tables and policies

## Step 3: Set up authentication

1. In your Supabase project, go to the "Authentication" section
2. Under "Settings", make sure "Email" provider is enabled
3. You can disable "Email confirmations" for simplicity in development
4. Create an admin user:
   - Go to "Users" section
   - Click "Add User"
   - Enter email: admin@flipnews.com
   - Enter password: admin123 (or a stronger password for production)

## Step 4: Get your Supabase credentials

1. In your Supabase project, go to the "Settings" section (gear icon)
2. Click on "API" in the sidebar
3. Copy the "URL" and "anon/public" key
4. Update your `.env.local` file with these values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-copied-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-copied-anon-key
   ```

## Step 5: Deploy to Vercel

### Option 1: Deploy using Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts and make sure to add your environment variables when asked

### Option 2: Deploy through the Vercel web interface

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "Add New..." → "Project"
4. Import your Git repository
5. Configure your project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next
   - Install Command: npm install
6. Add your environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
7. Click "Deploy"

## Step 6: Verify your deployment

1. Once deployment is complete, Vercel will provide you with a URL
2. Visit the URL to make sure your FlipNews app is working correctly
3. Try logging in to the admin panel at `/admin/login` with your admin credentials

## Troubleshooting

If you encounter any issues:

1. Check the Vercel deployment logs for errors
2. Make sure your environment variables are set correctly
3. Verify that your Supabase project is set up correctly
4. Check that your database tables were created successfully

## Next Steps

After successful deployment:

1. Add your custom domain in the Vercel dashboard
2. Set up automatic deployments from your Git repository
3. Consider adding more security measures for production use
