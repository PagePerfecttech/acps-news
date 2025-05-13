// Check Supabase storage buckets
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

// Check buckets
async function checkBuckets() {
  console.log('Checking storage buckets...');

  try {
    // List existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      console.log('\n===== MANUAL BUCKET CREATION INSTRUCTIONS =====');
      console.log('1. Go to https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets');
      console.log('2. Click "Create bucket" for each of these buckets:');
      BUCKETS.forEach(bucket => console.log(`   - ${bucket}`));
      console.log('3. For each bucket, click on "Policies" and add a policy to allow public access');
      console.log('===============================================\n');
      return;
    }

    console.log('Existing buckets:', existingBuckets?.map(b => b.name) || 'None');

    // Check which buckets need to be created
    const missingBuckets = BUCKETS.filter(bucket =>
      !existingBuckets?.some(existing => existing.name === bucket)
    );

    if (missingBuckets.length > 0) {
      console.log('\n===== MISSING BUCKETS =====');
      console.log('The following buckets need to be created manually:');
      missingBuckets.forEach(bucket => console.log(`- ${bucket}`));

      console.log('\n===== MANUAL BUCKET CREATION INSTRUCTIONS =====');
      console.log('1. Go to https://supabase.com/dashboard/project/tnaqvbrflguwpeafwclz/storage/buckets');
      console.log('2. Click "Create bucket" for each missing bucket');
      console.log('3. For each bucket, click on "Policies" and add a policy to allow public access');
      console.log('===============================================\n');
    } else {
      console.log('\n✅ All required buckets exist!');
    }

    // Check bucket policies
    console.log('\nChecking bucket policies...');
    for (const bucketName of existingBuckets?.map(b => b.name) || []) {
      if (BUCKETS.includes(bucketName)) {
        try {
          const { data, error } = await supabase.storage.from(bucketName).getPublicUrl('test.txt');
          if (error) {
            console.log(`❌ Bucket ${bucketName} may not have public access policy`);
          } else {
            console.log(`✅ Bucket ${bucketName} has public access policy`);
          }
        } catch (error) {
          console.log(`❓ Could not check policy for bucket ${bucketName}`);
        }
      }
    }

  } catch (error) {
    console.error('Error checking storage buckets:', error);
  }
}

// Run the check
checkBuckets()
  .then(() => {
    console.log('\nStorage check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running storage check script:', error);
    process.exit(1);
  });
