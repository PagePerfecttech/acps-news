// Script to add a test news article with an image to Supabase
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample image URL for testing
const sampleImageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000';

// Function to download an image
async function downloadImage(url, outputPath) {
  try {
    console.log(`Downloading image from ${url}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Image downloaded to ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Error downloading image:', error);
    return false;
  }
}

// Function to upload an image to Supabase Storage
async function uploadImageToSupabase(filePath) {
  try {
    console.log('Uploading image to Supabase Storage...');
    
    // Check if the news-images bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Error listing buckets: ${bucketsError.message}`);
    }
    
    const bucketName = 'news-images';
    const bucketExists = buckets.some(b => b.name === bucketName);
    
    // Create the bucket if it doesn't exist
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
      
      if (error) {
        throw new Error(`Error creating bucket: ${error.message}`);
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    }
    
    // Generate a unique filename
    const fileName = `test-article-${Date.now()}.jpg`;
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw new Error(`Error uploading to Supabase Storage: ${error.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    console.log('Image uploaded successfully!');
    console.log('Public URL:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
}

// Function to add a test news article
async function addTestNewsArticle(imageUrl) {
  try {
    console.log('Adding test news article to Supabase...');
    
    // Get a random category
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(10);
    
    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }
    
    if (!categories || categories.length === 0) {
      throw new Error('No categories found in the database');
    }
    
    // Select a random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Create a test article
    const testArticle = {
      title: `Test Article - ${new Date().toLocaleString()}`,
      content: `
        <p>This is a test article created on ${new Date().toLocaleString()}.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
        <p>This article was created using a script to test the Supabase database integration.</p>
        <img src="${imageUrl}" alt="Test Image" />
        <p>The image above was uploaded to Supabase Storage.</p>
      `,
      summary: 'This is a test article created by a script to test the Supabase database integration.',
      category_id: randomCategory.id,
      image_url: imageUrl,
      author: 'Test Script',
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert the article
    const { data, error } = await supabase
      .from('news_articles')
      .insert([testArticle])
      .select();
    
    if (error) {
      throw new Error(`Error inserting article: ${error.message}`);
    }
    
    console.log('Test article added successfully!');
    console.log('Article ID:', data[0].id);
    console.log('Article Title:', data[0].title);
    console.log('Category:', randomCategory.name);
    
    return data[0];
  } catch (error) {
    console.error('Error in addTestNewsArticle:', error);
    return null;
  }
}

// Main function
async function main() {
  console.log('Testing Supabase database by adding a news article with an image...');
  
  // Test connection to Supabase
  try {
    console.log('Testing connection to Supabase...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase!');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
  
  // Download a sample image
  const imagePath = path.join(__dirname, 'test-image.jpg');
  const imageDownloaded = await downloadImage(sampleImageUrl, imagePath);
  
  if (!imageDownloaded) {
    console.error('Failed to download the sample image. Using direct URL instead.');
    // Add the article with the direct image URL
    const article = await addTestNewsArticle(sampleImageUrl);
    
    if (article) {
      console.log('Test completed successfully!');
    } else {
      console.error('Test failed.');
    }
    
    process.exit(0);
  }
  
  // Upload the image to Supabase Storage
  const imageUrl = await uploadImageToSupabase(imagePath);
  
  if (!imageUrl) {
    console.error('Failed to upload the image to Supabase Storage. Using direct URL instead.');
    // Add the article with the direct image URL
    const article = await addTestNewsArticle(sampleImageUrl);
    
    if (article) {
      console.log('Test completed successfully!');
    } else {
      console.error('Test failed.');
    }
    
    // Clean up
    fs.unlinkSync(imagePath);
    
    process.exit(0);
  }
  
  // Add a test article with the uploaded image
  const article = await addTestNewsArticle(imageUrl);
  
  if (article) {
    console.log('Test completed successfully!');
  } else {
    console.error('Test failed.');
  }
  
  // Clean up
  fs.unlinkSync(imagePath);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
