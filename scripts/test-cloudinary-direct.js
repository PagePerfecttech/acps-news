// Script to directly test Cloudinary upload without going through the web interface
require('dotenv').config();
const fs = require('fs');
const path = require('path');
// Use global fetch if available, otherwise require node-fetch
const fetch = global.fetch || require('node-fetch');
const FormData = require('form-data');
const crypto = require('crypto');

// Cloudinary configuration - hardcoded for reliability
const cloudinaryConfig = {
  cloud_name: 'dejesejon',
  api_key: '137179496379745',
  api_secret: '2iwEKWNqCHLtSWKu9KvFv06zpDw',
};

// Function to generate a signature for Cloudinary uploads
function generateSignature(params, apiSecret) {
  // Sort the parameters
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // Create a string with key=value pairs
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Generate the signature using HMAC SHA-1
  return crypto
    .createHmac('sha1', apiSecret)
    .update(paramString)
    .digest('hex');
}

// Function to create a test image
function createTestImage(filePath) {
  try {
    console.log('Creating test image...');

    // Create a simple text file as a placeholder
    fs.writeFileSync(filePath, 'This is a test file for Cloudinary upload.');

    console.log('Test image created:', filePath);
    return true;
  } catch (error) {
    console.error('Error creating test image:', error);
    return false;
  }
}

// Function to directly upload to Cloudinary
async function uploadToCloudinary(filePath, options = {}) {
  try {
    console.log('Uploading directly to Cloudinary...');

    const {
      folder = 'test',
      resource_type = 'image',
      tags = ['test']
    } = options;

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create signature parameters
    const params = {
      timestamp,
      folder,
    };

    if (tags && Array.isArray(tags)) {
      params.tags = tags.join(',');
    }

    // Generate signature
    const signature = generateSignature(params, cloudinaryConfig.api_secret);
    console.log('Generated signature:', signature);

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('api_key', cloudinaryConfig.api_key);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    if (tags && Array.isArray(tags)) {
      formData.append('tags', tags.join(','));
    }

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/${resource_type}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to upload to Cloudinary:', errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      url: result.secure_url
    });

    return { success: true, result };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log('Testing direct Cloudinary upload...');

  // Create a test image
  const testImagePath = path.join(__dirname, 'test-image-direct.txt');
  const imageCreated = createTestImage(testImagePath);
  if (!imageCreated) {
    console.error('Failed to create test image.');
    process.exit(1);
  }

  // Upload the test image to Cloudinary
  const uploadResult = await uploadToCloudinary(testImagePath, {
    folder: 'news-images',
    tags: ['test', 'direct-upload']
  });

  if (!uploadResult.success) {
    console.error('Failed to upload test image to Cloudinary:', uploadResult.error);
    process.exit(1);
  }

  console.log('Direct Cloudinary upload test completed successfully!');
  console.log('Image URL:', uploadResult.result.secure_url);

  // Clean up the test image
  try {
    fs.unlinkSync(testImagePath);
    console.log('Test image deleted.');
  } catch (error) {
    console.error('Error deleting test image:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
