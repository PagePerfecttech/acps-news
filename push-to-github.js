// Script to push changes to GitHub
const { execSync } = require('child_process');

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
  console.log('FlipNEWS GitHub Push Script');
  console.log('===========================');
  
  // Add all changes
  console.log('Adding all changes...');
  executeCommand('git add .');
  
  // Commit changes
  console.log('Committing changes...');
  executeCommand('git commit -m "Updated for deployment with Cloudflare R2 integration"');
  
  // Push changes
  console.log('Pushing changes to GitHub...');
  executeCommand('git push origin main');
  
  console.log('Changes pushed to GitHub successfully!');
  console.log('You can now deploy to Vercel using the GitHub integration.');
  console.log('See DEPLOYMENT.md for instructions.');
}

// Run the main function
main();
