// Simple script to test Cloudinary upload
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const FormData = require('form-data');

// Cloudinary configuration
const cloudName = 'vrmmedia';
const apiKey = '137179496379745';
const apiSecret = '2iwEKWNqCHLtSWKu9KvFv06zpDw';

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

// Generate signature
const generateSignature = (params) => {
  const sortedParams = {};
  Object.keys(params).sort().forEach(key => {
    sortedParams[key] = params[key];
  });
  
  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  return crypto
    .createHmac('sha1', apiSecret)
    .update(paramString)
    .digest('hex');
};

// Upload file to Cloudinary
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    // Read file
    const fileData = fs.readFileSync(filePath);
    
    // Create form data
    const form = new FormData();
    form.append('file', fileData, {
      filename: path.basename(filePath),
      contentType: 'image/png'
    });
    
    // Add parameters
    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp,
      folder: 'news-images',
      api_key: apiKey
    };
    
    // Generate signature
    const signature = generateSignature(params);
    
    // Add parameters to form
    form.append('timestamp', timestamp);
    form.append('folder', 'news-images');
    form.append('api_key', apiKey);
    form.append('signature', signature);
    
    // Set up request options
    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloudName}/image/upload`,
      method: 'POST',
      headers: form.getHeaders()
    };
    
    // Make request
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP error ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // Send form data
    form.pipe(req);
  });
};

// Main function
const main = async () => {
  try {
    console.log('Testing Cloudinary upload...');
    console.log(`Cloud Name: ${cloudName}`);
    console.log(`API Key: ${apiKey}`);
    console.log(`API Secret: ${apiSecret ? '***' : 'Not set'}`);
    
    // Create test image
    const testImagePath = createTestImage();
    
    // Upload to Cloudinary
    console.log('Uploading test image to Cloudinary...');
    const result = await uploadToCloudinary(testImagePath);
    
    console.log('Upload successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    
    console.log(`Image URL: ${result.secure_url}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Run the main function
main();
