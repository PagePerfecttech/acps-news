// Test the upload API directly
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUploadAPI() {
  console.log('🧪 Testing Upload API...\n');
  
  try {
    // Create a test image file
    const testImagePath = 'test-image.jpg';
    const testImageContent = Buffer.from('fake-image-data-for-testing');
    fs.writeFileSync(testImagePath, testImageContent);
    
    console.log('📁 Created test image file');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('folder', 'news-images');
    
    console.log('📤 Sending upload request to /api/upload/r2...');
    
    // Make the upload request
    const response = await fetch('http://localhost:3000/api/upload/r2', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    const result = await response.json();
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Upload API is working!');
      console.log('🔗 Uploaded URL:', result.url);
    } else {
      console.log('❌ Upload API failed:', result.error);
    }
    
    // Clean up
    fs.unlinkSync(testImagePath);
    console.log('🧹 Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Error testing upload API:', error.message);
  }
}

// Test environment variables first
console.log('🔧 Environment Variables Check:');
console.log('- CLOUDFLARE_R2_ACCESS_KEY_ID:', process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? 'Set' : 'Missing');
console.log('- CLOUDFLARE_R2_SECRET_ACCESS_KEY:', process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
console.log('- CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME || 'Missing');
console.log('- NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL:', process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'Missing');
console.log('- NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID:', process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'Missing');
console.log('');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

console.log('🔧 After loading .env.local:');
console.log('- CLOUDFLARE_R2_ACCESS_KEY_ID:', process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? 'Set' : 'Missing');
console.log('- CLOUDFLARE_R2_SECRET_ACCESS_KEY:', process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing');
console.log('- CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME || 'Missing');
console.log('- NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL:', process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'Missing');
console.log('- NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID:', process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'Missing');
console.log('');

// Note: This test requires the development server to be running
console.log('⚠️  Note: This test requires the development server to be running on localhost:3000');
console.log('   Start the server with: npm run dev');
console.log('');

// Run the test
testUploadAPI();
