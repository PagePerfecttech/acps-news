// Script to test Cloudflare R2 configuration
require('dotenv').config({ path: './.env.local' });
const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Get Cloudflare R2 credentials from environment variables
const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

console.log('Cloudflare R2 Configuration:');
console.log('Account ID:', accountId ? 'Set (not showing for security)' : 'Not set');
console.log('Access Key ID:', accessKeyId ? 'Set (not showing for security)' : 'Not set');
console.log('Secret Access Key:', secretAccessKey ? 'Set (not showing for security)' : 'Not set');
console.log('Bucket Name:', bucketName);
console.log('Public URL:', publicUrl);

// Check if credentials are available
if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
  console.error('Error: Cloudflare R2 credentials not found in environment variables.');
  console.error('Please set the following variables in your .env.local file:');
  console.error('- NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID');
  console.error('- CLOUDFLARE_R2_ACCESS_KEY_ID');
  console.error('- CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  console.error('- CLOUDFLARE_R2_BUCKET_NAME');
  console.error('- NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL');
  process.exit(1);
}

// Create S3 client for R2
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

// Function to test connection to R2
async function testConnection() {
  try {
    console.log('\nTesting connection to Cloudflare R2...');
    
    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    
    console.log('✅ Successfully connected to Cloudflare R2!');
    console.log('Available buckets:', response.Buckets.map(bucket => bucket.Name).join(', '));
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Cloudflare R2:', error.message);
    return false;
  }
}

// Function to test uploading a file to R2
async function testUpload() {
  try {
    console.log('\nTesting file upload to Cloudflare R2...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    const testContent = 'This is a test file for Cloudflare R2 integration. ' + new Date().toISOString();
    fs.writeFileSync(testFilePath, testContent);
    
    // Upload the file
    const fileContent = fs.readFileSync(testFilePath);
    const fileName = 'test-folder/test-file.txt';
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: 'text/plain'
    });
    
    await s3.send(command);
    
    // Construct the public URL
    const fileUrl = `${publicUrl}/${fileName}`;
    
    console.log('✅ Successfully uploaded file to Cloudflare R2!');
    console.log('File URL:', fileUrl);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading file to Cloudflare R2:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing Cloudflare R2 integration...');
  
  // Test connection
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.error('Failed to connect to Cloudflare R2. Please check your credentials.');
    process.exit(1);
  }
  
  // Test upload
  const uploadSuccess = await testUpload();
  if (!uploadSuccess) {
    console.error('Failed to upload file to Cloudflare R2. Please check your bucket configuration.');
    process.exit(1);
  }
  
  console.log('\n✅ Cloudflare R2 integration is working correctly!');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
