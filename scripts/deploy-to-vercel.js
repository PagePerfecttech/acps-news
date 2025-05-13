// This script helps deploy the application to Vercel
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('FlipNEWS Vercel Deployment Script');
console.log('=================================');
console.log('This script will help you deploy your FlipNEWS application to Vercel.');
console.log('');

// Check if Vercel CLI is installed
const checkVercelCLI = () => {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Install Vercel CLI if not installed
const installVercelCLI = () => {
  console.log('Installing Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('Vercel CLI installed successfully!');
    return true;
  } catch (error) {
    console.error('Error installing Vercel CLI:', error.message);
    return false;
  }
};

// Login to Vercel
const loginToVercel = () => {
  console.log('Logging in to Vercel...');
  try {
    execSync('vercel login', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error logging in to Vercel:', error.message);
    return false;
  }
};

// Deploy to Vercel
const deployToVercel = (projectName) => {
  console.log(`Deploying to Vercel as ${projectName}...`);
  try {
    execSync(`vercel --name ${projectName} --confirm --prod`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error deploying to Vercel:', error.message);
    return false;
  }
};

// Check if environment variables are set
const checkEnvironmentVariables = () => {
  const envFile = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envFile)) {
    console.error('Error: .env.local file not found!');
    return false;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = [];
  requiredVars.forEach(variable => {
    if (!envContent.includes(`${variable}=`)) {
      missingVars.push(variable);
    }
  });

  if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
};

// Main function
const main = async () => {
  // Check environment variables
  if (!checkEnvironmentVariables()) {
    console.log('Please set up your environment variables in .env.local file before deploying.');
    rl.close();
    return;
  }

  // Check if Vercel CLI is installed
  if (!checkVercelCLI()) {
    console.log('Vercel CLI is not installed.');
    const shouldInstall = await new Promise(resolve => {
      rl.question('Do you want to install Vercel CLI? (y/n): ', answer => {
        resolve(answer.toLowerCase() === 'y');
      });
    });

    if (shouldInstall) {
      if (!installVercelCLI()) {
        console.log('Failed to install Vercel CLI. Please install it manually with "npm install -g vercel".');
        rl.close();
        return;
      }
    } else {
      console.log('Vercel CLI is required for deployment. Please install it manually with "npm install -g vercel".');
      rl.close();
      return;
    }
  }

  // Login to Vercel
  const shouldLogin = await new Promise(resolve => {
    rl.question('Do you want to log in to Vercel? (y/n): ', answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });

  if (shouldLogin) {
    if (!loginToVercel()) {
      console.log('Failed to log in to Vercel. Please try again later.');
      rl.close();
      return;
    }
  }

  // Get project name
  const projectName = await new Promise(resolve => {
    rl.question('Enter a name for your Vercel project (default: flipnews): ', answer => {
      resolve(answer || 'flipnews');
    });
  });

  // Deploy to Vercel
  if (deployToVercel(projectName)) {
    console.log('');
    console.log('Deployment successful!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Set up your database tables in Supabase');
    console.log('2. Create storage buckets in Supabase');
    console.log('3. Configure environment variables in Vercel dashboard');
    console.log('');
    console.log('For more information, see the DEPLOYMENT_GUIDE.md file.');
  } else {
    console.log('Deployment failed. Please try again later.');
  }

  rl.close();
};

main();
