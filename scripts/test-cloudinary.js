// This script tests the Cloudinary configuration
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Cloudinary configuration
// Note: These values are from your .env.local file
const cloudName = 'vrmmedia';
const apiKey = '137179496379745';
const apiSecret = '2iwEKWNqCHLtSWKu9KvFv06zpDw';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

// Define folder names for different types of media
const FOLDERS = {
  NEWS_IMAGES: 'news-images',
  NEWS_VIDEOS: 'news-videos',
  USER_AVATARS: 'user-avatars',
  SITE_ASSETS: 'site-assets',
};

// Function to check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(cloudName && apiKey && apiSecret);
};

// Function to create folders if they don't exist
const createFolders = async () => {
  console.log('Creating folders in Cloudinary...');

  for (const folder of Object.values(FOLDERS)) {
    try {
      // Check if folder exists
      const result = await cloudinary.api.root_folders();
      const folderExists = result.folders.some(f => f.name === folder);

      if (!folderExists) {
        console.log(`Creating folder: ${folder}`);
        await cloudinary.api.create_folder(folder);
        console.log(`Folder ${folder} created successfully`);
      } else {
        console.log(`Folder ${folder} already exists`);
      }
    } catch (error) {
      console.error(`Error creating folder ${folder}:`, error);
    }
  }
};

// Function to upload a test image
const uploadTestImage = async () => {
  console.log('Uploading test image to Cloudinary...');

  try {
    // Create a test image if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (!fs.existsSync(testImagePath)) {
      // Create a simple 1x1 pixel PNG
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
      fs.writeFileSync(testImagePath, buffer);
    }

    // Upload the test image
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: FOLDERS.NEWS_IMAGES,
      public_id: 'test-image',
      overwrite: true,
    });

    console.log('Test image uploaded successfully:');
    console.log(`- URL: ${result.secure_url}`);
    console.log(`- Public ID: ${result.public_id}`);
    console.log(`- Format: ${result.format}`);
    console.log(`- Size: ${result.bytes} bytes`);

    return result;
  } catch (error) {
    console.error('Error uploading test image:', error);
    return null;
  }
};

// Function to list images in a folder
const listImages = async (folder) => {
  console.log(`Listing images in folder: ${folder}...`);

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${folder}/`,
      max_results: 10,
    });

    console.log(`Found ${result.resources.length} images in folder ${folder}:`);
    result.resources.forEach(resource => {
      console.log(`- ${resource.public_id} (${resource.format}, ${resource.bytes} bytes)`);
    });

    return result.resources;
  } catch (error) {
    console.error(`Error listing images in folder ${folder}:`, error);
    return [];
  }
};

// Main function
const main = async () => {
  console.log('Testing Cloudinary configuration...');

  // Check if Cloudinary is configured
  if (!isCloudinaryConfigured()) {
    console.error('Cloudinary is not configured. Please set the following environment variables:');
    console.error('- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    console.error('- NEXT_PUBLIC_CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
    return;
  }

  console.log('Cloudinary configuration found:');
  console.log(`- Cloud Name: ${cloudName}`);
  console.log(`- API Key: ${apiKey}`);
  console.log(`- API Secret: ${apiSecret ? '***' : 'Not set'}`);

  try {
    // Test connection
    console.log('Testing connection to Cloudinary...');
    const accountResult = await cloudinary.api.ping();
    console.log('Connection successful:', accountResult);

    // Create folders
    await createFolders();

    // Upload test image
    const uploadResult = await uploadTestImage();

    if (uploadResult) {
      // List images in the folder
      await listImages(FOLDERS.NEWS_IMAGES);
    }

    console.log('Cloudinary test completed successfully!');
  } catch (error) {
    console.error('Error testing Cloudinary:', error);
  }
};

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
