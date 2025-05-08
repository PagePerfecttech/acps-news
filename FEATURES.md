# FlipNews Features Guide

This guide explains how to use the key features of the FlipNews application.

## 1. User Management

### Creating Users

1. Go to `/admin/users`
2. Click "Add New User"
3. Fill in the required information:
   - Name
   - Email
   - Password (required for new users)
   - Role (Admin, Contributor, or User)
   - Profile Picture (optional)
   - Bio (optional)
4. Click "Add User"

### Managing Users

1. Go to `/admin/users`
2. View all users in the system
3. Edit or delete users as needed

## 2. RSS Feed Management

### Adding RSS Feeds

1. Go to `/admin/rss`
2. Click "Add New Feed"
3. Fill in the required information:
   - Feed Name
   - Feed URL
   - Category (select from dropdown)
   - Fetch Frequency (in minutes)
   - Active (toggle to enable/disable automatic fetching)
4. Click "Add Feed"

### Adding Telugu RSS Feeds Automatically

We've created a script to add Telugu RSS feeds automatically:

```bash
npm run add-telugu-feeds
```

This will add the following feeds:
- Andhra Pradesh: https://telugu.hindustantimes.com/rss/andhra-pradesh
- Telangana: https://telugu.hindustantimes.com/rss/telangana
- Nation And World: https://telugu.hindustantimes.com/rss/national-international
- Business: https://telugu.hindustantimes.com/rss/business
- Sports: https://telugu.hindustantimes.com/rss/sports
- Entertainment: https://telugu.hindustantimes.com/rss/entertainment
- LifeStyle: https://telugu.hindustantimes.com/rss/lifestyle

### Processing RSS Feeds

1. Go to `/admin/rss`
2. Click the refresh icon next to a feed to process it
3. New articles will be imported into the system

## 3. Sharing News Articles

### Using the Share Button

1. When viewing a news article, click the "Share" button
2. A modal will appear with a screenshot of the article
3. You can:
   - Share the article directly (using the Web Share API if available)
   - Download the screenshot
   - Copy the link to the article

### Customizing Share Settings

1. Go to `/admin/settings`
2. Update the "Share Link" field with your website URL
3. Update the "Site Name" field to change the name that appears on shared content
4. Click "Save Settings"

## 4. Site Settings

### Updating Site Settings

1. Go to `/admin/settings`
2. Update the following settings:
   - Site Name: The name of your website
   - Primary Color: The main color used throughout the site
   - Secondary Color: The secondary color used for accents
   - Share Link: The URL used when sharing content
   - Logo: Upload a logo for your site
3. Click "Save Settings"

### Logo Upload

1. Go to `/admin/settings`
2. Click the upload button next to the Logo field
3. Select an image file
4. The logo will be uploaded and displayed in the preview
5. Click "Save Settings" to apply the changes

## 5. News Management

### Adding News Articles

1. Go to `/admin/news`
2. Click "Add New"
3. Fill in the required information:
   - Title
   - Content
   - Category
   - Image (upload or URL)
   - Video (optional)
   - Tags (optional)
4. Click "Add News"

### Managing News Articles

1. Go to `/admin/news`
2. View all news articles in the system
3. Edit or delete articles as needed

## 6. Category Management

### Adding Categories

1. Go to `/admin/categories`
2. Click "Add New Category"
3. Fill in the required information:
   - Name
   - Slug (auto-generated from name)
4. Click "Add Category"

### Managing Categories

1. Go to `/admin/categories`
2. View all categories in the system
3. Edit or delete categories as needed

## 7. Ad Management

### Adding Ads

1. Go to `/admin/ads`
2. Click "Add New Ad"
3. Fill in the required information:
   - Title
   - Description
   - Image or Video
   - Link URL
   - Active (toggle to enable/disable)
4. Click "Add Ad"

### Setting Ad Frequency

1. Go to `/admin/ads/settings`
2. Adjust the frequency slider
3. Click "Save Settings"

## Troubleshooting

### RSS Feed Issues

If you encounter issues with RSS feeds:

1. Make sure the RSS feed URL is valid and accessible
2. Check that you have created the necessary categories
3. Run the database initialization script:
   ```
   npm run init-db
   ```
4. Run the RSS setup script:
   ```
   npm run setup-rss
   ```

### Image Upload Issues

If you encounter issues with image uploads:

1. Make sure your Supabase storage is properly configured
2. Check that the storage buckets have the correct permissions
3. Try using an image URL instead of uploading

### Settings Not Updating

If settings changes are not reflected:

1. Clear your browser cache
2. Refresh the page
3. Make sure you clicked "Save Settings"
4. Check the browser console for any errors
