# Cloudflare R2 Migration Guide

This guide explains the migration from Cloudinary and Supabase storage to Cloudflare R2 as the primary storage solution.

## What Changed

### 🔄 Storage Provider Priority
- **Before**: Cloudinary → Supabase → ImgBB → Local
- **After**: Cloudflare R2 → ImgBB (emergency fallback) → Local

### 📦 Dependencies Removed
- `cloudinary` package
- `@supabase/supabase-js` package  
- `@supabase/ssr` package

### 🖼️ PNG Optimization
- Background images (site-assets folder) are automatically converted to PNG format
- PNG files are prioritized for better transparency and quality
- File extensions are properly handled for PNG conversion

## Setup Instructions

### 1. Configure Cloudflare R2

Create a Cloudflare R2 bucket and get your credentials:

```bash
# Required Environment Variables
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id  
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

### 2. Set Up R2 Bucket

1. Go to Cloudflare Dashboard → R2 Object Storage
2. Create a new bucket (e.g., `vizag-news-media`)
3. Configure public access for the bucket
4. Set up a custom domain (recommended) or use the R2.dev URL
5. Create API tokens with R2 permissions

### 3. Update Environment Variables

Copy `.env.example` to `.env.local` and fill in your R2 credentials:

```bash
cp .env.example .env.local
```

### 4. Install Dependencies

```bash
npm install
```

## Features

### 🎯 Automatic PNG Conversion
- Images uploaded to `site-assets` folder are converted to PNG
- Maintains transparency for background images
- Better quality for logos and graphics

### 🚀 Direct R2 Upload
- Background images use direct R2 upload API
- Faster upload process
- Better error handling

### 📁 Organized Storage Structure
```
your-r2-bucket/
├── news-images/     # News article images
├── user-avatars/    # User profile pictures  
├── site-assets/     # Background images, logos (PNG preferred)
└── news-videos/     # Video content
```

### 🔄 Fallback System
If R2 is unavailable:
1. ImgBB (if configured)
2. Local storage (development only)

## Migration Steps

### For Existing Installations

1. **Backup existing media** (if using Cloudinary/Supabase)
2. **Update environment variables** with R2 credentials
3. **Test upload functionality** in admin panel
4. **Re-upload background images** for PNG optimization
5. **Update any hardcoded URLs** to point to R2

### For New Installations

1. Set up Cloudflare R2 bucket
2. Configure environment variables
3. Run the application
4. Upload your background images through admin settings

## Troubleshooting

### Common Issues

**R2 Upload Fails**
- Check environment variables are set correctly
- Verify R2 bucket permissions
- Ensure API tokens have correct permissions

**Images Not Loading**
- Verify `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL` is correct
- Check bucket public access settings
- Ensure CORS is configured if needed

**PNG Conversion Issues**
- Only affects site-assets folder
- Original file is used if conversion fails
- Check browser console for conversion errors

### Debug Mode

Enable debug logging by checking browser console during uploads.

## Benefits of R2 Migration

✅ **Cost Effective**: Lower storage and bandwidth costs
✅ **Better Performance**: Global CDN with edge locations  
✅ **No Vendor Lock-in**: S3-compatible API
✅ **PNG Optimization**: Automatic conversion for background images
✅ **Simplified Stack**: Fewer external dependencies
✅ **Better Control**: Direct API access and configuration

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test with a simple image upload first
4. Check Cloudflare R2 dashboard for upload logs
