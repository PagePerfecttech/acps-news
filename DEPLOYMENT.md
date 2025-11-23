# Deploying FlipNEWS to Vercel

This guide will walk you through the process of deploying FlipNEWS to Vercel using the GitHub integration.

## Prerequisites

- A GitHub account
- A Vercel account
- The FlipNEWS repository on GitHub

## Deployment Steps

### 1. Push Your Changes to GitHub

Make sure all your changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect Your Repository to Vercel

1. Go to [Vercel](https://vercel.com/) and sign in with your account
2. Click on "Add New..." and select "Project"
3. Import your GitHub repository (FlipNEWS)
4. If you don't see your repository, you may need to configure the GitHub integration:
   - Click on "Adjust GitHub App Permissions"
   - Select the organization or account where your repository is located
   - Choose either "All repositories" or select the specific repository
   - Click "Save"

### 3. Configure Your Project

1. Once you've selected your repository, you'll be taken to the project configuration page
2. Vercel should automatically detect that it's a Next.js project
3. Configure the following settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4. Environment Variables

Add the following environment variables:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Your Cloudflare R2 access key ID
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Your Cloudflare R2 secret access key
- `CLOUDFLARE_R2_BUCKET_NAME`: Your Cloudflare R2 bucket name
- `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL`: Your Cloudflare R2 public URL

These values should match the ones in your `.env.local` file.

### 5. Deploy

1. Click on "Deploy"
2. Vercel will build and deploy your application
3. Once the deployment is complete, you'll be given a URL where your application is hosted

### 6. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Follow the instructions to configure your DNS settings

## Automatic Deployments

Vercel will automatically deploy your application whenever you push changes to your GitHub repository. This makes it easy to keep your application up to date.

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Make sure all your environment variables are correctly set
2. Check the build logs for any errors
3. Ensure your Supabase and Cloudflare R2 configurations are correct
4. Verify that your Next.js application builds successfully locally

## Vercel CLI (Alternative Method)

If you prefer to deploy using the Vercel CLI, you can use the following commands:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

When prompted, select your project and configure the settings as described above.
