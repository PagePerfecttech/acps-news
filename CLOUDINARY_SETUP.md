# Cloudinary Setup Guide for FlipNEWS

This guide will help you set up Cloudinary as the storage provider for your FlipNEWS application.

## Why Cloudinary?

Cloudinary is a cloud-based service that provides an end-to-end image and video management solution including uploads, storage, manipulations, optimizations and delivery.

Benefits of using Cloudinary:
- Automatic image optimization
- On-the-fly transformations
- CDN delivery
- Generous free tier (up to 25GB storage and 25GB bandwidth)
- Easy integration with Next.js

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary's registration page](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. Log in to your Cloudinary account
2. Go to the Dashboard
3. Note down the following credentials:
   - Cloud Name
   - API Key
   - API Secret

![Cloudinary Dashboard](https://res.cloudinary.com/demo/image/upload/v1612345678/cloudinary-dashboard.png)

## Step 3: Update Your Environment Variables

1. Open your `.env.local` file
2. Update the following variables with your Cloudinary credentials:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Create Folders in Cloudinary

For better organization, create the following folders in your Cloudinary account:

1. Log in to your Cloudinary account
2. Go to the Media Library
3. Click on "New folder" and create the following folders:
   - `news-images` - For storing news article images
   - `news-videos` - For storing news article videos
   - `user-avatars` - For storing user profile pictures
   - `site-assets` - For storing site assets like logos, icons, etc.

## Step 5: Test Your Cloudinary Setup

1. Run the following script to test your Cloudinary setup:

```bash
node scripts/test-cloudinary.js
```

2. If the test is successful, you should see a message like:

```
Test image uploaded successfully:
- URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/news-images/test-image.png
- Public ID: news-images/test-image
- Format: png
- Size: 123 bytes
```

## Step 6: Configure Upload Presets (Optional)

For additional security, you can create upload presets in Cloudinary:

1. Log in to your Cloudinary account
2. Go to Settings > Upload
3. Scroll down to "Upload presets" and click "Add upload preset"
4. Configure the preset:
   - Name: `flipnews_preset`
   - Signing Mode: `Signed`
   - Folder: Leave empty (we'll specify folders in the code)
   - Allowed formats: `jpg,png,gif,webp,mp4,webm`
   - Enable the following options:
     - Use filename or externally defined public ID
     - Unique filename
     - Overwrite
   - Click "Save"

## Troubleshooting

### Image Upload Fails

If image uploads fail, check the following:

1. Verify your Cloudinary credentials in `.env.local`
2. Make sure your Cloudinary account is active
3. Check if you have enough storage in your Cloudinary account
4. Check the browser console for any errors

### Signature Error

If you see a signature error like:

```
Invalid Signature 64067754ca904e9981d4ed649accf5e0dd0e34b2
```

This usually means:
1. Your API secret is incorrect
2. The timestamp in the signature has expired
3. The parameters in the signature don't match the parameters in the request

### CORS Issues

If you see CORS errors in the browser console:

1. Log in to your Cloudinary account
2. Go to Settings > Security
3. Add your website domain to the "Allowed CORS origins" list

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Cloudinary Transformation Reference](https://cloudinary.com/documentation/image_transformation_reference)

## Next Steps

After setting up Cloudinary, you can:

1. Customize image transformations for different use cases
2. Set up automatic image optimization
3. Configure responsive images
4. Implement video transcoding and streaming

For more information, refer to the [Cloudinary Documentation](https://cloudinary.com/documentation).
