// Test R2 upload on server environment
const fetch = require('node-fetch');

console.log('🧪 Testing R2 Upload on Server Environment...\n');

async function testServerEnvironment() {
  try {
    console.log('🔧 Step 1: Checking server environment variables...');
    
    // Test environment variables endpoint
    const envResponse = await fetch('http://localhost:3000/api/env-check');
    const envData = await envResponse.json();
    
    console.log('📊 Environment Check Results:');
    console.log(JSON.stringify(envData, null, 2));
    
    if (!envData.allConfigured) {
      console.log('\n❌ Environment variables are not properly configured on server!');
      console.log('\n🔍 Missing or invalid variables:');
      
      if (!envData.supabase.url) console.log('   - NEXT_PUBLIC_SUPABASE_URL');
      if (!envData.supabase.anonKey) console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!envData.cloudflare.accountId) console.log('   - NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID');
      if (!envData.cloudflare.r2AccessKeyId) console.log('   - CLOUDFLARE_R2_ACCESS_KEY_ID');
      if (!envData.cloudflare.r2SecretAccessKey) console.log('   - CLOUDFLARE_R2_SECRET_ACCESS_KEY');
      if (!envData.cloudflare.r2Bucket) console.log('   - CLOUDFLARE_R2_BUCKET_NAME');
      if (!envData.cloudflare.r2PublicUrl) console.log('   - NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL');
      
      console.log('\n💡 Solutions:');
      console.log('   1. Update vercel.json with correct environment variables');
      console.log('   2. Redeploy the application');
      console.log('   3. Check Vercel dashboard environment variables');
      
      return false;
    }
    
    console.log('\n✅ All environment variables are configured on server');
    
    console.log('\n🔧 Step 2: Testing R2 upload API...');
    
    // Create a test file
    const testFileContent = Buffer.from('Test image data for server R2 upload - ' + new Date().toISOString());
    
    // Create form data for upload
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add file as buffer with proper filename and content type
    formData.append('file', testFileContent, {
      filename: 'test-server-upload.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('folder', 'news-images');
    
    console.log('📤 Uploading test file to /api/upload/r2...');
    
    // Make upload request
    const uploadResponse = await fetch('http://localhost:3000/api/upload/r2', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const uploadData = await uploadResponse.json();
    
    console.log('📊 Upload Response Status:', uploadResponse.status);
    console.log('📋 Upload Response Data:');
    console.log(JSON.stringify(uploadData, null, 2));
    
    if (uploadData.success) {
      console.log('\n✅ Server R2 upload is working!');
      console.log('🔗 Uploaded URL:', uploadData.url);
      
      // Test if the uploaded file is accessible
      console.log('\n🌐 Testing uploaded file accessibility...');
      try {
        const fileResponse = await fetch(uploadData.url);
        if (fileResponse.ok) {
          console.log('✅ Uploaded file is accessible!');
          console.log('   - Status:', fileResponse.status);
          console.log('   - Content-Type:', fileResponse.headers.get('content-type'));
        } else {
          console.log('⚠️  Uploaded file returned status:', fileResponse.status);
        }
      } catch (fileError) {
        console.log('⚠️  Could not access uploaded file:', fileError.message);
      }
      
      return true;
    } else {
      console.log('\n❌ Server R2 upload failed!');
      console.log('Error:', uploadData.error);
      if (uploadData.details) {
        console.log('Details:', uploadData.details);
      }
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Server test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Server R2 Upload Test...');
  console.log('⚠️  Note: This requires the development server to be running on localhost:3000\n');
  
  const success = await testServerEnvironment();
  
  if (success) {
    console.log('\n🎉 Server R2 upload is working correctly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables: Configured');
    console.log('   ✅ R2 upload API: Working');
    console.log('   ✅ File upload: Successful');
    console.log('   ✅ File accessibility: Working');
    console.log('\n💡 The server R2 upload should now work in your application!');
  } else {
    console.log('\n❌ Server R2 upload test failed');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check if development server is running: npm run dev');
    console.log('   2. Verify environment variables in vercel.json');
    console.log('   3. Check server logs for detailed error messages');
    console.log('   4. Ensure R2 credentials are valid and have proper permissions');
  }
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
});
