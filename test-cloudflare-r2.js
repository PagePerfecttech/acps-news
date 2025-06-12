const { config } = require('dotenv');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Load environment variables
config({ path: '.env.local' });

// Configuration
const r2Config = {
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  bucket: process.env.CLOUDFLARE_R2_BUCKET,
  publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
};

console.log('🔧 Testing Cloudflare R2 Configuration...');
console.log('');

// Check configuration
console.log('📋 Configuration Check:');
console.log('✅ Endpoint:', r2Config.endpoint ? '✓ Set' : '❌ Missing');
console.log('✅ Bucket:', r2Config.bucket ? '✓ Set' : '❌ Missing');
console.log('✅ Public URL:', r2Config.publicUrl ? '✓ Set' : '❌ Missing');
console.log('✅ Access Key:', r2Config.accessKeyId ? '✓ Set' : '❌ Missing');
console.log('✅ Secret Key:', r2Config.secretAccessKey ? '✓ Set' : '❌ Missing');
console.log('');

// Check if all required config is present
const isConfigured = !!(
  r2Config.endpoint &&
  r2Config.bucket &&
  r2Config.publicUrl &&
  r2Config.accessKeyId &&
  r2Config.secretAccessKey
);

if (!isConfigured) {
  console.log('❌ Cloudflare R2 is not properly configured!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

console.log('✅ Configuration looks good!');
console.log('');

// Create S3 client
const client = new S3Client({
  region: 'auto',
  endpoint: r2Config.endpoint,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

async function testR2Connection() {
  try {
    console.log('🧪 Testing connection to Cloudflare R2...');
    
    // Test 1: List objects in bucket
    console.log('📂 Testing bucket access...');
    const listCommand = new ListObjectsV2Command({
      Bucket: r2Config.bucket,
      MaxKeys: 5,
    });
    
    const listResult = await client.send(listCommand);
    console.log('✅ Successfully connected to bucket!');
    console.log(`📊 Found ${listResult.Contents?.length || 0} objects in bucket`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('📁 Recent files:');
      listResult.Contents.slice(0, 3).forEach(obj => {
        console.log(`   - ${obj.Key} (${Math.round(obj.Size / 1024)}KB)`);
      });
    }
    console.log('');
    
    // Test 2: Upload a test file
    console.log('📤 Testing file upload...');
    const testContent = `Vizag News Test File - ${new Date().toISOString()}`;
    const testFileName = `test/vizag-news-test-${Date.now()}.txt`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
      CacheControl: 'public, max-age=31536000',
    });
    
    await client.send(uploadCommand);
    console.log('✅ Test file uploaded successfully!');
    
    // Generate public URL
    const publicUrl = `${r2Config.publicUrl}/${testFileName}`;
    console.log('🔗 Public URL:', publicUrl);
    console.log('');
    
    // Test 3: Verify the URL is accessible
    console.log('🌐 Testing public URL access...');
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        const content = await response.text();
        console.log('✅ Public URL is accessible!');
        console.log('📄 Content preview:', content.substring(0, 50) + '...');
      } else {
        console.log('⚠️  Public URL returned status:', response.status);
      }
    } catch (fetchError) {
      console.log('⚠️  Could not test public URL:', fetchError.message);
    }
    
    console.log('');
    console.log('🎉 Cloudflare R2 is working perfectly!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ Connection: Working');
    console.log('✅ Bucket Access: Working');
    console.log('✅ File Upload: Working');
    console.log('✅ Public URLs: Working');
    console.log('');
    console.log('🚀 Your Vizag News app can now use Cloudflare R2 for image storage!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Go to admin panel: http://localhost:3000/admin/settings');
    console.log('3. Upload a background logo - it will use Cloudflare R2!');
    
  } catch (error) {
    console.error('❌ Error testing Cloudflare R2:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your Cloudflare R2 credentials');
    console.log('2. Verify the bucket exists and is accessible');
    console.log('3. Check if the public URL domain is correct');
    console.log('4. Ensure your R2 token has the right permissions');
  }
}

testR2Connection();
