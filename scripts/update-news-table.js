// Script to update the news_articles table schema in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute a raw SQL query
async function executeRawQuery(query) {
  try {
    const { data, error } = await supabase.rpc('pgexecute', { query });

    if (error) {
      console.error('Error executing raw query:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error executing raw query:', error);
    return { success: false, error };
  }
}

// Function to check if a column exists in a table
async function checkColumnExists(tableName, columnName) {
  try {
    const result = await executeRawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        AND column_name = '${columnName}'
      );
    `);

    if (!result.success) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, result.error);
      return false;
    }

    return result.data && result.data.length > 0 && result.data[0].exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
}

// Function to add a column to a table
async function addColumn(tableName, columnName, columnType) {
  try {
    console.log(`Adding column ${columnName} to table ${tableName}...`);
    
    const result = await executeRawQuery(`
      ALTER TABLE ${tableName} 
      ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};
    `);
    
    if (!result.success) {
      console.error(`Error adding column ${columnName} to table ${tableName}:`, result.error);
      return false;
    }
    
    console.log(`Column ${columnName} added to table ${tableName} successfully`);
    return true;
  } catch (error) {
    console.error(`Error adding column ${columnName} to table ${tableName}:`, error);
    return false;
  }
}

// Function to check if a table exists
async function checkTableExists(tableName) {
  try {
    const result = await executeRawQuery(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );
    `);

    if (!result.success) {
      console.error(`Error checking if table ${tableName} exists:`, result.error);
      return false;
    }

    return result.data && result.data.length > 0 && result.data[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to create the news_articles table if it doesn't exist
async function createNewsArticlesTable() {
  try {
    console.log('Creating news_articles table...');
    
    const tableExists = await checkTableExists('news_articles');
    if (tableExists) {
      console.log('news_articles table already exists');
      return true;
    }
    
    const result = await executeRawQuery(`
      CREATE TABLE news_articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        category_id UUID REFERENCES categories(id),
        image_url TEXT,
        video_url TEXT,
        video_type VARCHAR(50),
        author VARCHAR(255),
        user_id UUID,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        tags TEXT[] DEFAULT '{}'
      );
    `);
    
    if (!result.success) {
      console.error('Error creating news_articles table:', result.error);
      return false;
    }
    
    console.log('news_articles table created successfully');
    return true;
  } catch (error) {
    console.error('Error creating news_articles table:', error);
    return false;
  }
}

// Function to update the news_articles table schema
async function updateNewsArticlesTable() {
  try {
    console.log('Updating news_articles table schema...');
    
    // Check if the table exists
    const tableExists = await checkTableExists('news_articles');
    if (!tableExists) {
      console.log('news_articles table does not exist, creating it...');
      const tableCreated = await createNewsArticlesTable();
      if (!tableCreated) {
        console.error('Failed to create news_articles table');
        return false;
      }
    }
    
    // Check if video_type column exists
    const videoTypeExists = await checkColumnExists('news_articles', 'video_type');
    if (!videoTypeExists) {
      console.log('video_type column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'video_type', 'VARCHAR(50)');
      if (!columnAdded) {
        console.error('Failed to add video_type column');
        return false;
      }
    } else {
      console.log('video_type column already exists');
    }
    
    // Check if tags column exists
    const tagsExists = await checkColumnExists('news_articles', 'tags');
    if (!tagsExists) {
      console.log('tags column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'tags', 'TEXT[] DEFAULT \'{}\'');
      if (!columnAdded) {
        console.error('Failed to add tags column');
        return false;
      }
    } else {
      console.log('tags column already exists');
    }
    
    // Check if views column exists
    const viewsExists = await checkColumnExists('news_articles', 'views');
    if (!viewsExists) {
      console.log('views column does not exist, adding it...');
      const columnAdded = await addColumn('news_articles', 'views', 'INTEGER DEFAULT 0');
      if (!columnAdded) {
        console.error('Failed to add views column');
        return false;
      }
    } else {
      console.log('views column already exists');
    }
    
    console.log('news_articles table schema updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating news_articles table schema:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Updating news_articles table schema in Supabase...');
  
  // Update the news_articles table schema
  const updated = await updateNewsArticlesTable();
  if (!updated) {
    console.error('Failed to update news_articles table schema');
    process.exit(1);
  }
  
  console.log('news_articles table schema updated successfully!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
