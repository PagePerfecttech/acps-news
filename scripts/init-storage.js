// Initialize Supabase storage buckets
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define bucket names
const BUCKETS = [
  'news-images',
  'news-videos',
  'user-avatars',
  'site-assets'
];

// Initialize buckets
async function initializeBuckets() {
  console.log('Initializing storage buckets...');
  
  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Existing buckets:', existingBuckets?.map(b => b.name) || 'None');
    
    // Create buckets if they don't exist
    for (const bucketName of BUCKETS) {
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: bucketName.includes('video') ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
        } else {
          console.log(`Bucket ${bucketName} created successfully`);
          
          // Set public access policy
          const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl('dummy.txt', 1);
          if (policyError && !policyError.message.includes('not found')) {
            console.error(`Error checking bucket policy for ${bucketName}:`, policyError);
          }
          
          // Try to update bucket policy to public
          try {
            // This is a workaround to make the bucket public
            const { error: updateError } = await supabase.rpc('update_bucket_policy', {
              bucket_name: bucketName,
              policy: 'public'
            });
            
            if (updateError) {
              console.warn(`Could not update bucket policy for ${bucketName} via RPC:`, updateError);
              
              // Alternative method: try to set public access
              const { error: policyError } = await supabase.storage.from(bucketName).getPublicUrl('dummy.txt');
              if (policyError) {
                console.error(`Error setting public access for ${bucketName}:`, policyError);
              }
            }
          } catch (policyError) {
            console.warn(`Error setting bucket policy for ${bucketName}:`, policyError);
          }
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
    }
    
    console.log('Storage buckets initialization completed');
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
}

// Run the initialization
initializeBuckets()
  .then(() => {
    console.log('Storage initialization script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running storage initialization script:', error);
    process.exit(1);
  });
