# Deploying FlipNEWS to Vercel

This guide will walk you through the process of deploying your FlipNEWS application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your FlipNEWS project with Supabase and Cloudflare configured

## Deployment Steps

### 1. Push Your Code to GitHub (Optional)

If you want to set up continuous deployment, push your code to a GitHub repository:

```bash
# Initialize a git repository if you haven't already
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add your GitHub repository as a remote
git remote add origin https://github.com/yourusername/flipnews.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Vercel Using the Vercel CLI

You can deploy directly from your local machine using the Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel
```

### 3. Deploy to Vercel Using the Vercel Dashboard

Alternatively, you can deploy using the Vercel dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository or upload your project files
4. Configure the project settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Add the following environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ykurlhisznbthlpiyslo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrdXJsaGlzem5idGhscGl5c2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjM5MDYsImV4cCI6MjA2MjgzOTkwNn0.-_2lhpWMpL0SXlSKEjiCATYYhHyBzK9JQZUvgBdR138
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrdXJsaGlzem5idGhscGl5c2xvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzI2MzkwNiwiZXhwIjoyMDYyODM5OTA2fQ.cyCA2alf8NaCbUbDbaMVBuOhX_taj8H4tN7qdfd0J04
   NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=3dc18ef389ef7b9e298e9b25b54ca52a
   CLOUDFLARE_R2_ACCESS_KEY_ID=41e5208605657cd2ba1f23f2dbbe97de
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=887359052f16128670fd8b4b557b9a72ba2402a6112e30a1ae8cc0336b867696
   CLOUDFLARE_R2_BUCKET_NAME=vvdflip
   NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://pub-e7ff7485d109499f9164e5959b53f7dc.r2.dev
   ```
6. Click "Deploy"

## Post-Deployment Steps

### 1. Configure Custom Domain (Optional)

1. In your Vercel project dashboard, go to "Settings" > "Domains"
2. Add your custom domain and follow the instructions to set up DNS

### 2. Set Up Continuous Deployment (If Using GitHub)

If you deployed from GitHub, Vercel will automatically set up continuous deployment. Every time you push to your repository, Vercel will automatically deploy the changes.

### 3. Test Your Deployed Application

1. Visit your deployed application at the Vercel URL (e.g., `https://flipnews.vercel.app`)
2. Test the following functionality:
   - Viewing news articles
   - Adding test articles using the admin API
   - Uploading images to Cloudflare R2
   - Any other critical features

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check the build logs in the Vercel dashboard
2. Make sure all dependencies are correctly installed
3. Verify that your environment variables are correctly set
4. Check for any TypeScript or ESLint errors

### API Errors

If your API routes are not working:

1. Check that your Supabase and Cloudflare credentials are correct
2. Verify that your database tables are properly set up
3. Check for CORS issues if you're accessing the API from a different domain

### Image Loading Issues

If images are not loading:

1. Make sure your Cloudflare R2 bucket is properly configured
2. Check that the image domains are correctly set in `next.config.js`
3. Verify that the image URLs are correctly formatted

## Need Help?

If you need further assistance, you can:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Check the [Next.js documentation](https://nextjs.org/docs)
3. Check the [Supabase documentation](https://supabase.com/docs)
4. Check the [Cloudflare R2 documentation](https://developers.cloudflare.com/r2/)
