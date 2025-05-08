# FlipNews Quick Start Guide

This guide will help you quickly set up and test the FlipNews application.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase account and project

## Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd FlipNews
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Initialize the database**

```bash
npm run init-db
npm run setup-rss
```

5. **Start the development server**

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Testing Key Features

### 1. User Management

1. Go to http://localhost:3000/admin/users
2. Click "Add New User"
3. Fill in the form with the following details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Admin
4. Click "Add User"
5. Verify that the user appears in the list

### 2. RSS Feed Management

1. Go to http://localhost:3000/admin/rss
2. Click "Add New Feed"
3. Fill in the form with the following details:
   - Feed Name: Test Feed
   - Feed URL: https://rss.nytimes.com/services/xml/rss/nyt/World.xml
   - Category: Select any category from the dropdown
   - Fetch Frequency: 60
   - Active: Checked
4. Click "Add Feed"
5. Verify that the feed appears in the list
6. Click the refresh icon to process the feed
7. Go to http://localhost:3000 to see the imported news articles

### 3. Telugu RSS Feeds

1. Run the Telugu RSS feeds script:

```bash
npm run add-telugu-feeds
```

2. Go to http://localhost:3000/admin/rss
3. Verify that the Telugu RSS feeds have been added
4. Process each feed by clicking the refresh icon
5. Go to http://localhost:3000 to see the imported news articles

### 4. Screenshot Sharing

1. Go to http://localhost:3000
2. Find a news article
3. Click the "Share" button
4. Verify that a screenshot of the article is displayed in the modal
5. Test the download and share options

### 5. Settings Management

1. Go to http://localhost:3000/admin/settings
2. Update the following settings:
   - Site Name: My FlipNews
   - Primary Color: #FF5733
   - Secondary Color: #33FF57
   - Share Link: http://localhost:3000
3. Upload a logo image
4. Click "Save Settings"
5. Go to http://localhost:3000
6. Verify that the site name and colors have been updated
7. Test the share functionality to verify that it uses the new site name

## Troubleshooting

### Database Issues

If you encounter database issues:

1. Make sure your Supabase project is set up correctly
2. Check that your environment variables are correct
3. Run the database initialization scripts again:

```bash
npm run init-db
npm run setup-rss
```

### Image Upload Issues

If you encounter issues with image uploads:

1. Make sure your Supabase storage is properly configured
2. Check that the storage buckets have the correct permissions
3. Try using an image URL instead of uploading

### RSS Feed Issues

If you encounter issues with RSS feeds:

1. Make sure the RSS feed URL is valid and accessible
2. Check that you have created the necessary categories
3. Run the RSS setup script:

```bash
npm run setup-rss
```

## Next Steps

After testing the basic functionality, you can:

1. Customize the application to your needs
2. Add more RSS feeds
3. Create more users and categories
4. Add advertisements
5. Deploy the application to a hosting service like Vercel

For more detailed information, refer to the following documents:

- FEATURES.md - Detailed guide to all features
- TESTING.md - Comprehensive testing report
- TROUBLESHOOTING.md - Solutions to common issues
