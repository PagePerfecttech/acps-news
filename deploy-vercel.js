// Simple script to deploy FlipNEWS to Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute a command and log the output
function executeCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return { success: true, output };
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Main function
function main() {
  console.log('FlipNEWS Vercel Deployment Script');
  console.log('=================================');
  
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('Vercel CLI is installed');
  } catch (error) {
    console.error('Vercel CLI is not installed. Please install it with: npm install -g vercel');
    process.exit(1);
  }
  
  // Deploy to Vercel
  console.log('Deploying to Vercel...');
  executeCommand('vercel --yes');
}

// Run the main function
main();
