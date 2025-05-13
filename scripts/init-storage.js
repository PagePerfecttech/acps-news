// Initialize Supabase storage buckets
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from environment variables
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
