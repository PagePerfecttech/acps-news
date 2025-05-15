// Script to test Cloudflare API connection
require('dotenv').config({ path: './.env.local' });
const fetch = require('node-fetch');

// Get Cloudflare credentials from environment variables
const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN || 'your_api_token'; // You might need to add this to your .env.local

console.log('Cloudflare Configuration:');
console.log('Account ID:', accountId ? 'Set (not showing for security)' : 'Not set');
console.log('API Token:', apiToken !== 'your_api_token' ? 'Set (not showing for security)' : 'Not set');

// Check if credentials are available
if (!accountId) {
  console.error('Error: Cloudflare Account ID not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID in your .env.local file.');
  process.exit(1);
}

// Function to test connection to Cloudflare API
async function testCloudflareConnection() {
  try {
    console.log('\nTesting connection to Cloudflare API...');
    
    // Make a request to the Cloudflare API to get account details
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Successfully connected to Cloudflare API!');
      console.log('Account Name:', data.result.name);
      return true;
    } else {
      console.error('❌ Error connecting to Cloudflare API:', data.errors[0]?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to Cloudflare API:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing Cloudflare API connection...');
  
  // Test connection
  const connectionSuccess = await testCloudflareConnection();
  if (!connectionSuccess) {
    console.error('Failed to connect to Cloudflare API. Please check your credentials.');
    
    // Suggest adding API token
    console.log('\nYou might need to add a Cloudflare API token to your .env.local file:');
    console.log('CLOUDFLARE_API_TOKEN=your_api_token');
    console.log('\nTo create an API token:');
    console.log('1. Go to https://dash.cloudflare.com/profile/api-tokens');
    console.log('2. Click "Create Token"');
    console.log('3. Use the "Edit Cloudflare Workers" template or create a custom token with R2 permissions');
    console.log('4. Add the token to your .env.local file');
    
    process.exit(1);
  }
  
  console.log('\n✅ Cloudflare API connection is working correctly!');
  console.log('\nNext steps:');
  console.log('1. Make sure your R2 bucket is properly configured');
  console.log('2. Update your application to use Cloudflare R2 for storage');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
