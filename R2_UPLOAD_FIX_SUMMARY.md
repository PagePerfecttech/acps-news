# 🔧 R2 Upload Fix - Issue Resolution

## 🚨 Problem Identified
News article images were still uploading to Cloudinary (`https://res.cloudinary.com/...`) instead of Cloudflare R2.

## 🔍 Root Cause
The news upload components were using `/api/upload/server` endpoint which was hardcoded to use Cloudinary.

## ✅ Fixes Applied

### 1. **Updated News Upload Components**
- **File**: `app/admin/news/add/page.tsx`
- **Changes**:
  - Changed from `/api/upload/server` to `/api/upload/r2`
  - Updated form data to use `folder` instead of `type` and `bucket`
  - Applied to both image and video uploads

- **File**: `app/admin/news/edit/[id]/page.tsx`
- **Changes**:
  - Changed from `/api/upload` to `/api/upload/r2`
  - Updated form data parameters

### 2. **Converted Server Upload Route to R2**
- **File**: `app/api/upload/server/route.ts`
- **Changes**:
  - Removed all Cloudinary dependencies and logic
  - Replaced with Cloudflare R2 S3-compatible upload
  - Added PNG prioritization for site-assets
  - Updated error handling for R2

### 3. **Cleaned Media Service Dependencies**
- **File**: `app/lib/mediaService.fixed.ts`
- **Changes**:
  - Removed Cloudinary service import
  - Removed Supabase upload function
  - Updated storage provider types
  - Simplified provider configuration

## 🎯 Expected Result
Now when you upload images in news articles, they should:
1. Upload directly to your Cloudflare R2 bucket
2. Return URLs like: `https://your-bucket.your-domain.com/news-images/uuid.jpg`
3. No longer use Cloudinary URLs

## 🧪 Testing Steps

### 1. **Configure R2 Environment Variables**
```bash
# Add these to your .env.local file
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-domain.com
```

### 2. **Test R2 Configuration**
```bash
# Visit this URL to test R2 setup
http://localhost:3000/api/test-r2
```

### 3. **Test News Image Upload**
1. Go to Admin → News Management → Add News
2. Upload an image
3. Check that the URL starts with your R2 domain
4. Verify the image loads correctly

### 4. **Test Background Image Upload**
1. Go to Admin → Settings
2. Upload a background logo
3. Should auto-convert to PNG and upload to R2

## 🔄 Upload Flow Now

```
News Image Upload → /api/upload/r2 → Cloudflare R2 → Your R2 URL
Background Image → /api/upload/r2 → PNG Conversion → Cloudflare R2
```

## 🚨 Important Notes

1. **Backup**: If you had existing images on Cloudinary, they won't be automatically migrated
2. **URLs**: New uploads will use R2 URLs, existing Cloudinary URLs will still work
3. **Configuration**: Make sure all R2 environment variables are set correctly
4. **Bucket Setup**: Ensure your R2 bucket has public read access configured

## 🔧 Troubleshooting

**If uploads still go to Cloudinary:**
- Clear browser cache and restart dev server
- Check that you're using the updated components
- Verify R2 environment variables are set

**If R2 uploads fail:**
- Check `/api/test-r2` endpoint for configuration issues
- Verify R2 bucket permissions
- Check browser console for error messages

**If images don't load:**
- Verify `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL` is correct
- Check R2 bucket public access settings
- Ensure CORS is configured if needed

The fix is now complete! Your news article images should upload to Cloudflare R2 instead of Cloudinary.
