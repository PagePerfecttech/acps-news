// Simple script to test Cloudinary upload
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dejesejon',
  api_key: '137179496379745',
  api_secret: '2iwEKWNqCHLtSWKu9KvFv06zpDw',
  secure: true
});

// Create a test image
const createTestImage = () => {
  const testImagePath = path.join(__dirname, 'test-image.png');
  if (!fs.existsSync(testImagePath)) {
    // Create a simple 1x1 pixel PNG
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, buffer);
    console.log('Test image created:', testImagePath);
  }
  return testImagePath;
};

// Upload file to Cloudinary using the SDK
const uploadToCloudinary = (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    folder: 'news-images',
    public_id: 'test-image-' + Date.now(),
    overwrite: true
  });
};

// Main function
const main = async () => {
  try {
    console.log('Testing Cloudinary upload...');
    console.log('Cloudinary configuration:');
    console.log(`- Cloud Name: ${cloudinary.config().cloud_name}`);
    console.log(`- API Key: ${cloudinary.config().api_key}`);
    console.log(`- API Secret: ${cloudinary.config().api_secret ? '***' : 'Not set'}`);

    // Create test image
    const testImagePath = createTestImage();

    // Test connection
    console.log('Testing connection to Cloudinary...');
    const accountResult = await cloudinary.api.ping();
    console.log('Connection successful:', accountResult);

    // Upload to Cloudinary
    console.log('Uploading test image to Cloudinary...');
    const result = await uploadToCloudinary(testImagePath);

    console.log('Upload successful!');
    console.log('Image details:');
    console.log(`- URL: ${result.secure_url}`);
    console.log(`- Public ID: ${result.public_id}`);
    console.log(`- Format: ${result.format}`);
    console.log(`- Size: ${result.bytes} bytes`);

    // List images in the folder
    console.log('Listing images in folder: news-images...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'news-images/',
      max_results: 10
    });

    console.log(`Found ${resources.resources.length} images in folder news-images:`);
    resources.resources.forEach(resource => {
      console.log(`- ${resource.public_id} (${resource.format}, ${resource.bytes} bytes)`);
    });

    console.log('Cloudinary test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the main function
main();
