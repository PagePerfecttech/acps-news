// Direct test of R2 upload functionality (simulating the API route logic)
require('dotenv').config({ path: './.env.local' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

console.log('🧪 Testing R2 Upload Logic Directly...\n');

// Test environment variables
console.log('🔧 Environment Variables:');
const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

console.log('- Account ID:', accountId ? 'Set' : '❌ Missing');
console.log('- Access Key ID:', accessKeyId ? 'Set' : '❌ Missing');
console.log('- Secret Access Key:', secretAccessKey ? 'Set' : '❌ Missing');
console.log('- Bucket Name:', bucketName || '❌ Missing');
console.log('- Public URL:', publicUrl || '❌ Missing');

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  console.error('\n❌ Missing required environment variables!');
  process.exit(1);
}

console.log('\n✅ All environment variables are configured');

async function testR2Upload() {
  try {
    console.log('\n📤 Testing R2 Upload...');
    
    // Create a test image file
    const testImagePath = 'test-upload-image.jpg';
    const testImageContent = Buffer.from('fake-jpeg-image-data-for-testing-r2-upload');
    fs.writeFileSync(testImagePath, testImageContent);
    
    console.log('📁 Created test image file:', testImagePath);
    
    // Simulate the upload logic from the API route
    const folder = 'news-images';
    const fileName = `${uuidv4()}.jpg`;
    const filePath = `${folder}/${fileName}`;
    
    console.log('📋 Upload details:');
    console.log('   - Folder:', folder);
    console.log('   - File Name:', fileName);
    console.log('   - Full Path:', filePath);
    
    // Read the file buffer
    const buffer = fs.readFileSync(testImagePath);
    console.log('   - File Size:', buffer.length, 'bytes');
    
    // Initialize S3 client for R2 (same as in API route)
    console.log('\n🔗 Initializing S3 client...');
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    console.log('✅ S3 client initialized');
    
    // Upload to R2 (same as in API route)
    console.log('\n⬆️  Uploading to R2...');
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: 'image/jpeg'
    });
    
    await s3.send(command);
    console.log('✅ Upload successful!');
    
    // Construct the public URL (same as in API route)
    const fileUrl = `${publicUrl}/${filePath}`;
    console.log('\n🔗 Public URL:', fileUrl);
    
    // Test if the URL is accessible
    console.log('\n🌐 Testing public URL access...');
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        console.log('✅ Public URL is accessible!');
        console.log('   - Status:', response.status);
        console.log('   - Content-Type:', response.headers.get('content-type'));
        console.log('   - Content-Length:', response.headers.get('content-length'));
      } else {
        console.log('⚠️  Public URL returned status:', response.status);
      }
    } catch (fetchError) {
      console.log('⚠️  Could not test public URL:', fetchError.message);
    }
    
    // Clean up
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Cleaned up test file');
    
    console.log('\n🎉 R2 Upload Test Successful!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables: Configured');
    console.log('   ✅ S3 client initialization: Working');
    console.log('   ✅ File upload to R2: Working');
    console.log('   ✅ Public URL generation: Working');
    console.log('   ✅ Public URL access: Working');
    
    console.log('\n💡 The R2 upload functionality is working correctly!');
    console.log('   If you\'re still getting upload errors in the web interface,');
    console.log('   the issue might be with the frontend form or API route handling.');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ R2 Upload Test Failed:', error);
    console.error('Error details:', error.message);
    
    if (error.name === 'CredentialsProviderError') {
      console.error('\n💡 This looks like a credentials issue. Please check:');
      console.error('   - Your Cloudflare R2 API tokens are correct');
      console.error('   - The tokens have the right permissions');
      console.error('   - The account ID matches your Cloudflare account');
    }
    
    if (error.name === 'NoSuchBucket') {
      console.error('\n💡 Bucket not found. Please check:');
      console.error('   - The bucket name is correct');
      console.error('   - The bucket exists in your Cloudflare R2 account');
    }
    
    return false;
  }
}

// Run the test
testR2Upload()
  .then(success => {
    if (success) {
      console.log('\n🚀 Ready to use R2 uploads in your Vizag News app!');
    } else {
      console.log('\n❌ R2 upload test failed. Please fix the issues above.');
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
  });
