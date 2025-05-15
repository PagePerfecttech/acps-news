// Simple script to deploy FlipNEWS to Vercel
require('dotenv').config({ path: './.env.local' });
const { execSync } = require('child_process');

// Function to execute a command and return the output
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Main function
function main() {
  console.log('FlipNEWS Simple Deployment Script');
  console.log('=================================');
  
  // Deploy to Vercel with a specific project name
  console.log('Deploying to Vercel...');
  
  // Create a .vercel.env file with environment variables
  console.log('Creating environment variables file...');
  const envVars = [
    `NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    `SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID}`,
    `CLOUDFLARE_R2_ACCESS_KEY_ID=${process.env.CLOUDFLARE_R2_ACCESS_KEY_ID}`,
    `CLOUDFLARE_R2_SECRET_ACCESS_KEY=${process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY}`,
    `CLOUDFLARE_R2_BUCKET_NAME=${process.env.CLOUDFLARE_R2_BUCKET_NAME}`,
    `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL=${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}`
  ];
  
  // Deploy with specific project name and environment variables
  executeCommand(`vercel --name flipnews-app --confirm --env NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL} --env NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} --env SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
}

// Run the main function
main();
