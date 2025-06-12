const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://wtwetyalktzkimwtiwun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0d2V0eWFsa3R6a2ltd3Rpd3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTgxNTksImV4cCI6MjA2NTI5NDE1OX0.44EU7VKJPO7W7Xpvf-X6zp58O0KuBYZ0seRTfLextR0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('🗄️  Setting up Supabase Storage...');
  
  try {
    // Check if storage buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Error checking buckets:', bucketsError.message);
      console.log('📋 Manual Setup Required:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Click "Storage" in the sidebar');
      console.log('3. Create these buckets:');
      console.log('   - news-images (public)');
      console.log('   - site-assets (public)');
      console.log('4. Set them to "Public" for easy access');
      return;
    }
    
    console.log('✅ Storage accessible! Found buckets:', buckets.map(b => b.name));
    
    // Check for required buckets
    const requiredBuckets = ['news-images', 'site-assets'];
    const existingBuckets = buckets.map(b => b.name);
    
    for (const bucketName of requiredBuckets) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`⚠️  Bucket "${bucketName}" not found`);
        console.log(`📋 Please create bucket "${bucketName}" in your Supabase dashboard`);
      } else {
        console.log(`✅ Bucket "${bucketName}" exists`);
      }
    }
    
    // Test upload capability (if buckets exist)
    if (existingBuckets.includes('news-images')) {
      console.log('🧪 Testing upload capability...');
      
      // Create a simple test file
      const testContent = 'This is a test file for Vizag News';
      const testFile = new Blob([testContent], { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload('test/test.txt', testFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.log('❌ Upload test failed:', uploadError.message);
        console.log('💡 This might be due to RLS policies. Check your bucket settings.');
      } else {
        console.log('✅ Upload test successful!');
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('news-images')
          .getPublicUrl('test/test.txt');
        
        console.log('🔗 Test file URL:', urlData.publicUrl);
        
        // Clean up test file
        await supabase.storage.from('news-images').remove(['test/test.txt']);
        console.log('🧹 Test file cleaned up');
      }
    }
    
    console.log('');
    console.log('📋 Storage Setup Summary:');
    console.log('✅ Supabase Storage is available');
    console.log('✅ Your app can use Supabase for image storage');
    console.log('✅ Free tier includes 1GB storage');
    console.log('');
    console.log('🎯 How to use:');
    console.log('1. Go to admin panel: http://localhost:3000/admin/settings');
    console.log('2. Upload background logo using the upload button');
    console.log('3. Images will be stored in Supabase automatically');
    console.log('');
    console.log('💡 Alternative: You can still use external URLs (Unsplash, etc.)');
    
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
  }
}

setupStorage();
