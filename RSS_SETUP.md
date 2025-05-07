# RSS Feed Setup for FlipNews

This document provides instructions for setting up and using the RSS feed functionality in FlipNews.

## Overview

The RSS feed feature allows you to:

1. Automatically import news articles from external RSS feeds
2. Associate imported articles with specific users as authors
3. Categorize imported articles
4. Schedule automatic imports at regular intervals

## Database Setup

1. Run the SQL script to create the necessary tables:

```sql
-- Execute this in your Supabase SQL Editor
-- File: supabase/rss_schema.sql
```

## Configuration

### Environment Variables

For the cron job functionality, add the following environment variable to your Vercel project:

```
CRON_SECRET=your-secret-key-here
```

This secret key is used to secure the cron job endpoint.

### Vercel Cron Setup (Optional)

To set up automatic RSS feed processing, add the following to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron/rss?secret=your-secret-key-here",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

This will run the RSS feed processor every 30 minutes.

## Usage

### Adding RSS Feeds

1. Log in to the admin panel
2. Navigate to "RSS Feeds" in the sidebar
3. Click "Add Feed"
4. Fill in the required information:
   - Feed Name: A descriptive name for the feed
   - RSS URL: The URL of the RSS feed
   - Category: Select the category for imported articles
   - Author (User): Select the user who will be set as the author
   - Fetch Frequency: How often the feed should be checked (in minutes)
   - Active: Whether the feed is active or not

### Manual Processing

You can manually process RSS feeds by:

1. Going to the RSS Feeds page in the admin panel
2. Clicking the "Refresh" button next to a feed

### Automatic Processing

If you've set up the Vercel cron job, feeds will be processed automatically according to the schedule.

## Troubleshooting

### Feed Not Importing

1. Check if the feed is marked as "Active"
2. Verify the RSS URL is correct and accessible
3. Check the Supabase logs for any errors
4. Try processing the feed manually to see specific errors

### Database Issues

1. Make sure you've run the `rss_schema.sql` script
2. Check that your Supabase connection is properly configured
3. Verify that the user has the necessary permissions

## Technical Details

### API Endpoints

- `GET /api/rss` - Get all RSS feeds
- `POST /api/rss` - Create a new RSS feed
- `PUT /api/rss/:id` - Update an RSS feed
- `DELETE /api/rss/:id` - Delete an RSS feed
- `POST /api/rss/process` - Process RSS feeds
- `GET /api/cron/rss` - Cron job endpoint for automatic processing

### Data Flow

1. The system fetches the RSS feed content
2. It checks for new items by comparing GUIDs
3. For each new item, it creates a news article
4. The article is associated with the specified user and category
5. The system tracks which items have been imported to avoid duplicates

## Dependencies

- `rss-parser`: Used to parse RSS feeds
- Supabase: Used for database storage and retrieval
