# 🚀 Vercel Deployment Guide for Vizag News

## Quick Deployment Steps

### 1. Connect Repository
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub
- Click "Add New..." → "Project"
- Import `PagePerfecttech/Vizag-News`

### 2. Environment Variables
Add these in Vercel dashboard under "Environment Variables":

```bash
# Required - Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://wtwetyalktzkimwtiwun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0d2V0eWFsa3R6a2ltd3Rpd3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTgxNTksImV4cCI6MjA2NTI5NDE1OX0.44EU7VKJPO7W7Xpvf-X6zp58O0KuBYZ0seRTfLextR0

# Required - Cloudflare R2 Storage
CLOUDFLARE_R2_ENDPOINT=https://4ab691f283d3b63c6ce3a49e4f33f298.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=vizajnews
CLOUDFLARE_R2_PUBLIC_URL=https://pub-8f37c342d7194c4199e9b0e6c186f62d.r2.dev
CLOUDFLARE_R2_ACCESS_KEY_ID=95cd03d4415e84138943935d120f8d57
CLOUDFLARE_R2_SECRET_ACCESS_KEY=aab6a0d84c0a598373642eb0f6f175aca09d47317b11e62a582c9a78f2636c43
```

### 3. Deploy
- Click "Deploy"
- Wait 2-3 minutes for build
- Get your live URL

## Post-Deployment Setup

### 1. Update Site Settings
After deployment, update these in admin panel:

1. Go to `https://your-app.vercel.app/admin/login`
2. Login: `admin@vizagnews.com` / `admin123`
3. Go to Settings
4. Update "Share Link" to your Vercel URL
5. Upload your background logo
6. Save settings

### 2. Test Features
- ✅ Background logo upload (should use Cloudflare R2)
- ✅ News article creation
- ✅ Image uploads
- ✅ Vertical swipe navigation
- ✅ Admin panel functionality

### 3. Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Update share link in app settings

## Environment Variables Explained

### Supabase (Database)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key for client-side access

### Cloudflare R2 (Storage)
- `CLOUDFLARE_R2_ENDPOINT`: S3-compatible endpoint
- `CLOUDFLARE_R2_BUCKET`: Your bucket name (vizajnews)
- `CLOUDFLARE_R2_PUBLIC_URL`: Public CDN URL for serving files
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: API access key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: API secret key

## Troubleshooting

### Build Errors
- Check all environment variables are set
- Ensure no typos in variable names
- Verify all values are correct

### Database Issues
- Test Supabase connection in admin panel
- Check if all tables exist
- Verify RLS policies allow access

### Storage Issues
- Test image upload in admin panel
- Check Cloudflare R2 credentials
- Verify bucket permissions

### Performance
- Images should load from Cloudflare CDN
- Check Network tab in browser dev tools
- Verify R2 public URLs are working

## Success Checklist

After deployment, verify:
- ✅ App loads at Vercel URL
- ✅ Admin panel accessible
- ✅ Database connection working
- ✅ Image uploads to Cloudflare R2
- ✅ Background logo management
- ✅ News articles display
- ✅ Vertical swipe navigation
- ✅ Responsive design on mobile

## Automatic Deployments

Once connected:
- ✅ Every push to `main` branch auto-deploys
- ✅ Preview deployments for pull requests
- ✅ Rollback capability if needed
- ✅ Build logs and monitoring

Your Vizag News app will be live and globally accessible! 🌍
