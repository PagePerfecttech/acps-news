// This script helps you set up the environment variables for your FlipNews application
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('FlipNews Environment Setup');
console.log('==========================');
console.log('This script will help you set up the environment variables for your FlipNews application.');
console.log('You will need your Supabase URL and anon key from the Supabase dashboard.');
console.log('');

// Ask for Supabase URL
rl.question('Enter your Supabase URL (e.g., https://yourproject.supabase.co): ', (supabaseUrl) => {
  if (!supabaseUrl) {
    console.error('Error: Supabase URL is required.');
    rl.close();
    return;
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (e) {
    console.error('Error: Invalid URL format. Please enter a valid URL.');
    rl.close();
    return;
  }

  // Ask for Supabase anon key
  rl.question('Enter your Supabase anon key: ', (supabaseAnonKey) => {
    if (!supabaseAnonKey) {
      console.error('Error: Supabase anon key is required.');
      rl.close();
      return;
    }

    // Create .env.local file
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;

    fs.writeFile('.env.local', envContent, (err) => {
      if (err) {
        console.error('Error writing .env.local file:', err);
        rl.close();
        return;
      }

      console.log('');
      console.log('Environment variables have been saved to .env.local');
      console.log('');
      console.log('Next steps:');
      console.log('1. Restart your development server if it\'s running');
      console.log('2. If deploying to Vercel, add these environment variables in the Vercel dashboard');
      console.log('');
      console.log('For more information, see the SETUP_INSTRUCTIONS.md file.');

      rl.close();
    });
  });
});
