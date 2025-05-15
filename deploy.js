// Script to deploy FlipNEWS to Vercel
require('dotenv').config({ path: './.env.local' });
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute a command and return the output
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to check if Vercel CLI is installed
function checkVercelCLI() {
  const result = executeCommand('vercel --version');
  if (!result.success) {
    console.error('Vercel CLI is not installed. Please install it with: npm install -g vercel');
    process.exit(1);
  }
  console.log(`Vercel CLI is installed: ${result.output.trim()}`);
}

// Function to check if user is logged in to Vercel
function checkVercelLogin() {
  const result = executeCommand('vercel whoami');
  if (!result.success) {
    console.log('You are not logged in to Vercel. Please login with: vercel login');
    executeCommand('vercel login');
  } else {
    console.log(`Logged in to Vercel as: ${result.output.trim()}`);
  }
}

// Function to deploy to Vercel
function deployToVercel() {
  console.log('Deploying to Vercel...');
  
  // Create a temporary .vercel.json file with environment variables
  const vercelConfig = {
    "version": 2,
    "buildCommand": "next build",
    "outputDirectory": ".next",
    "devCommand": "next dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "SUPABASE_SERVICE_ROLE_KEY": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID": process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID,
      "CLOUDFLARE_R2_ACCESS_KEY_ID": process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY": process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      "CLOUDFLARE_R2_BUCKET_NAME": process.env.CLOUDFLARE_R2_BUCKET_NAME,
      "NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL": process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL
    }
  };
  
  // Deploy to Vercel
  const result = executeCommand('vercel --yes');
  
  if (result.success) {
    console.log('Deployment successful!');
    console.log(result.output);
    
    // Extract the deployment URL
    const lines = result.output.split('\n');
    let deploymentUrl = '';
    
    for (const line of lines) {
      if (line.includes('https://') && !line.includes('vercel.com')) {
        deploymentUrl = line.trim();
        break;
      }
    }
    
    if (deploymentUrl) {
      console.log(`Your application is deployed at: ${deploymentUrl}`);
      console.log(`Test page: ${deploymentUrl}/deployment-test.html`);
    }
  } else {
    console.error('Deployment failed:');
    console.error(result.error);
  }
}

// Main function
function main() {
  console.log('FlipNEWS Deployment Script');
  console.log('=========================');
  
  // Check if Vercel CLI is installed
  checkVercelCLI();
  
  // Check if user is logged in to Vercel
  checkVercelLogin();
  
  // Deploy to Vercel
  deployToVercel();
}

// Run the main function
main();
