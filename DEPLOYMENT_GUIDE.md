# FlipNEWS Deployment Guide

This guide will help you deploy the FlipNEWS application to Vercel.

## Prerequisites

1. A Vercel account
2. A Supabase account with a project set up
3. (Optional) A Cloudinary account for image and video storage

## Step 1: Set Up Environment Variables

Before deploying, make sure you have the following environment variables set up:

```
NEXT_PUBLIC_SUPABASE_URL=https://tnaqvbrflguwpeafwclz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Step 2: Set Up Database Tables

1. Go to the Supabase SQL Editor: https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/editor
2. Run the SQL script from `scripts/create_tables.sql` to create all the necessary tables

## Step 3: Set Up Storage Buckets

1. Go to the Supabase Storage page: https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets
2. Create the following buckets:
   - `news-images`
   - `news-videos`
   - `user-avatars`
   - `site-assets`
3. For each bucket, click on "Policies" and add a policy to allow public access

## Step 4: Deploy to Vercel

1. Push your code to a GitHub repository
2. Log in to Vercel and create a new project
3. Connect your GitHub repository
4. Configure the following settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
5. Add the environment variables from Step 1
6. Click "Deploy"

## Step 5: Verify Deployment

1. Once the deployment is complete, visit your Vercel URL
2. Check if the application is working correctly
3. Test the admin panel by visiting `/admin`

## Troubleshooting

### Database Connection Issues

If you're experiencing database connection issues:

1. Check if your Supabase URL and anon key are correct
2. Make sure your Supabase project is active
3. Check if the database tables are created correctly

### Storage Issues

If you're experiencing storage issues:

1. Check if the storage buckets are created correctly
2. Make sure the bucket policies allow public access
3. Consider using Cloudinary as an alternative storage solution

### Build Errors

If you're experiencing build errors:

1. Check the build logs for specific errors
2. Make sure all dependencies are installed
3. Try disabling TypeScript and ESLint checks during builds by setting `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` in `next.config.js`

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## Security Considerations

1. **API Keys**: Never expose your API keys in client-side code. Use environment variables for sensitive information.
2. **Database Access**: Use Row Level Security (RLS) to control access to your database tables.
3. **Authentication**: Implement proper authentication and authorization for your application.
4. **CORS**: Configure CORS to only allow requests from trusted domains.
5. **Content Security Policy**: Implement a Content Security Policy to prevent XSS attacks.

## Maintenance

1. **Backups**: Regularly backup your database.
2. **Updates**: Keep your dependencies up to date.
3. **Monitoring**: Set up monitoring to track the performance and health of your application.
4. **Logging**: Implement proper logging to help with debugging.
5. **Error Handling**: Implement proper error handling to provide a better user experience.
