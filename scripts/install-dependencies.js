// This script installs the required dependencies for the RSS feed functionality
const { execSync } = require('child_process');

console.log('Installing required dependencies for FlipNews RSS functionality...');

try {
  // Install dependencies
  console.log('Installing dotenv...');
  execSync('npm install dotenv --save-dev', { stdio: 'inherit' });
  
  console.log('Installing rss-parser...');
  execSync('npm install rss-parser --save', { stdio: 'inherit' });
  
  console.log('Installing uuid...');
  execSync('npm install uuid --save', { stdio: 'inherit' });
  
  console.log('Installing @types/uuid...');
  execSync('npm install @types/uuid --save-dev', { stdio: 'inherit' });
  
  console.log('All dependencies installed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure your Supabase environment variables are set in .env.local');
  console.log('2. Run "npm run setup" to initialize the database and set up RSS functionality');
  console.log('3. Start the development server with "npm run dev"');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  console.log('');
  console.log('Please try installing the dependencies manually:');
  console.log('npm install dotenv --save-dev');
  console.log('npm install rss-parser --save');
  console.log('npm install uuid --save');
  console.log('npm install @types/uuid --save-dev');
}
