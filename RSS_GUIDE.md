# FlipNews RSS Feed Guide

This guide explains how to use the RSS feed functionality in the FlipNews application, with a focus on Telugu RSS feeds from Hindustantimes.

## Setting Up RSS Feeds

### Automatic Setup

The easiest way to set up the Telugu RSS feeds is to use the provided script:

```bash
npm run add-telugu-feeds
```

This script will:
1. Create the necessary categories if they don't exist
2. Create a system user if it doesn't exist
3. Add all the Telugu RSS feeds from Hindustantimes

### Manual Setup

If you prefer to add the feeds manually:

1. Go to `/admin/rss`
2. Click "Add New Feed"
3. Fill in the form with the feed details:
   - Feed Name: (e.g., "Andhra Pradesh")
   - Feed URL: (e.g., "https://telugu.hindustantimes.com/rss/andhra-pradesh")
   - Category: Select an appropriate category
   - Fetch Frequency: 60 (or your preferred frequency in minutes)
   - Active: Checked
4. Click "Add Feed"
5. Repeat for each feed

## Telugu RSS Feeds

The following Telugu RSS feeds from Hindustantimes are supported:

1. **Andhra Pradesh**
   - URL: https://telugu.hindustantimes.com/rss/andhra-pradesh
   - Category: Regional

2. **Telangana**
   - URL: https://telugu.hindustantimes.com/rss/telangana
   - Category: Regional

3. **Nation And World**
   - URL: https://telugu.hindustantimes.com/rss/national-international
   - Category: News

4. **Business**
   - URL: https://telugu.hindustantimes.com/rss/business
   - Category: Business

5. **Sports**
   - URL: https://telugu.hindustantimes.com/rss/sports
   - Category: Sports

6. **Entertainment**
   - URL: https://telugu.hindustantimes.com/rss/entertainment
   - Category: Entertainment

7. **LifeStyle**
   - URL: https://telugu.hindustantimes.com/rss/lifestyle
   - Category: Lifestyle

## Processing RSS Feeds

### Manual Processing

To manually process an RSS feed:

1. Go to `/admin/rss`
2. Find the feed you want to process
3. Click the refresh icon next to the feed
4. Wait for the processing to complete
5. Check the notifications for results

### Automatic Processing

RSS feeds are automatically processed based on their fetch frequency. For example, if a feed has a fetch frequency of 60 minutes, it will be processed every hour.

## Testing RSS Feeds

To test if the RSS feeds are working correctly:

```bash
npm run test-rss
```

This script will:
1. Fetch each Telugu RSS feed
2. Parse the feed
3. Display information about the feed and its items
4. Show a summary of which feeds are working

## Troubleshooting

### Feed Not Parsing

If a feed is not parsing correctly:

1. Check if the feed URL is accessible by opening it in a browser
2. Run the test script to see if there are any specific errors
3. Check the browser console for error messages
4. Make sure you have the required dependencies installed:
   ```bash
   npm install rss-parser
   ```

### Images Not Displaying

If images from RSS feeds are not displaying:

1. Check if the image URLs are accessible
2. Look at the RSS feed XML to see how images are structured
3. Check the browser console for any CORS errors
4. If using a CORS proxy, make sure it's configured correctly

### Telugu Characters Not Displaying Correctly

If Telugu characters are not displaying correctly:

1. Make sure your application is using UTF-8 encoding
2. Check if the RSS feed is providing proper encoding
3. Look for any character encoding issues in the browser console

## Advanced Configuration

### CORS Proxy

If you're experiencing CORS issues when fetching RSS feeds, you can set up a CORS proxy:

1. Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_CORS_PROXY=https://your-cors-proxy.com/
   ```

2. The RSS processor will automatically use this proxy when fetching feeds

### Custom RSS Parser Configuration

If you need to customize the RSS parser configuration:

1. Open `app/lib/rssProcessor.ts`
2. Modify the `parseRssFeed` function to adjust the parser configuration
3. Add any custom field mappings as needed

## Adding New RSS Feeds

To add a new RSS feed:

1. Go to `/admin/rss`
2. Click "Add New Feed"
3. Fill in the form with the feed details
4. Click "Add Feed"
5. Process the feed by clicking the refresh icon

## Viewing RSS Feed Articles

RSS feed articles are displayed in the main news feed along with other articles. They are categorized based on the category assigned to the RSS feed.

To view articles from a specific category:

1. Go to the main page
2. Use the category filter to select the desired category
3. Browse the articles from that category
