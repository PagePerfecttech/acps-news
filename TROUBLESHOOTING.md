# FlipNews Troubleshooting Guide

This guide addresses common issues with the FlipNews application and provides solutions.

## RSS Feed Issues

### "Add Feed" Button Not Working

If the "Add Feed" button is not working, it could be due to:

1. **Database Schema Mismatch**: The database schema might not match the code.
   - Solution: Run the setup scripts to ensure the database schema is correct:
     ```
     npm run setup
     ```

2. **Missing Dependencies**: Required dependencies might be missing.
   - Solution: Install the required dependencies:
     ```
     npm run install-deps
     ```

3. **Field Name Mismatch**: There might be a mismatch between field names in the form and the API.
   - Solution: The code has been updated to use consistent field names.

### Using Categories with RSS Feeds

To use categories with RSS feeds:

1. First, make sure you have categories created in the admin panel:
   - Go to `/admin/categories`
   - Add categories if needed

2. When adding an RSS feed:
   - Select a category from the dropdown
   - The RSS feed will be associated with that category
   - Articles imported from the RSS feed will be assigned to that category

## Image Upload Issues

### Uploaded Images Not Displaying

If uploaded images are not displaying in posts, it could be due to:

1. **Storage Not Configured**: Supabase Storage might not be properly configured.
   - Solution: Make sure your Supabase project has Storage enabled and the required buckets created.

2. **Local URLs**: The application might be using local URLs instead of storage URLs.
   - Solution: The code has been updated to use Supabase Storage for image uploads.

3. **Missing Permissions**: The application might not have permission to access the storage buckets.
   - Solution: Make sure the storage buckets have the correct permissions:
     - Go to your Supabase dashboard
     - Navigate to Storage
     - Select the bucket (e.g., news-images)
     - Go to Policies
     - Make sure there's a policy that allows public access for SELECT operations

### Images from URL Displaying but Uploaded Images Not

If images from URLs are displaying but uploaded images are not, it could be due to:

1. **CORS Issues**: The browser might be blocking access to the uploaded images due to CORS.
   - Solution: Make sure your Supabase Storage has the correct CORS configuration:
     - Go to your Supabase dashboard
     - Navigate to Storage
     - Go to Settings
     - Add your application URL to the allowed origins

2. **URL Format**: The URL format for uploaded images might be incorrect.
   - Solution: The code has been updated to use the correct URL format for Supabase Storage.

## General Implementation Issues

### Project Not Working

If the project is not working in general, try these steps:

1. **Install Dependencies**: Make sure all dependencies are installed:
   ```
   npm install
   npm run install-deps
   ```

2. **Set Up Environment Variables**: Make sure your environment variables are set correctly:
   - Create a `.env.local` file in the root directory
   - Add your Supabase URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Initialize Database**: Run the database initialization script:
   ```
   npm run init-db
   ```

4. **Set Up RSS Functionality**: Run the RSS setup script:
   ```
   npm run setup-rss
   ```

5. **Restart Development Server**: Restart the development server:
   ```
   npm run dev
   ```

### Database Schema Issues

If you're experiencing database schema issues:

1. **Check Schema**: Make sure your database schema matches the expected schema:
   - The `rss_feeds` table should have the fields: id, name, url, category_id, user_id, active, last_fetched, fetch_frequency, created_at, updated_at
   - The `rss_feed_items` table should have the fields: id, feed_id, guid, title, link, pub_date, news_article_id, imported, created_at
   - The `news_articles` table should have the fields: rss_feed_id, rss_item_guid

2. **Run Schema Update**: Run the schema update script:
   ```
   npm run init-db
   ```

3. **Manual Update**: If the script doesn't work, you can manually update the schema using the SQL in `supabase/schema.sql`

## Still Having Issues?

If you're still experiencing issues after trying these solutions:

1. **Check Console Errors**: Open your browser's developer console (F12) and check for any error messages.

2. **Check Server Logs**: Check the server logs for any error messages.

3. **Verify Supabase Connection**: Make sure your application can connect to Supabase:
   - Go to your Supabase dashboard
   - Check that your project is active
   - Verify that your API keys are correct

4. **Contact Support**: If all else fails, contact support for further assistance.
