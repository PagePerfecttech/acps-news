// This script initializes the categories table with default categories
require('dotenv').config();
const fetch = require('node-fetch');

// Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
  process.exit(1);
}

// Default categories to create
const defaultCategories = [
  { name: 'సినిమా', slug: 'cinema' },
  { name: 'రాజకీయం', slug: 'politics' },
  { name: 'క్రీడలు', slug: 'sports' },
  { name: 'వ్యాపారం', slug: 'business' },
  { name: 'టెక్నాలజీ', slug: 'technology' },
  { name: 'ఆరోగ్యం', slug: 'health' },
  { name: 'విద్య', slug: 'education' },
  { name: 'రాష్ట్రీయం', slug: 'state' },
  { name: 'జాతీయం', slug: 'national' },
  { name: 'అంతర్జాతీయం', slug: 'international' }
];

async function initCategories() {
  console.log('Initializing categories table...');

  try {
    // Check if there are any categories
    const response = await fetch(`${supabaseUrl}/rest/v1/categories?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Categories table might not exist. Please create it in the Supabase dashboard.');
        return;
      }

      const error = await response.text();
      console.error('Error checking categories:', error);
      return;
    }

    const existingCategories = await response.json();

    // If no categories exist, add the default ones
    if (!existingCategories || existingCategories.length === 0) {
      console.log('No categories found. Adding default categories...');

      // Add default categories
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(defaultCategories)
      });

      if (!insertResponse.ok) {
        const error = await insertResponse.text();
        console.error('Error adding default categories:', error);
        return;
      }

      const data = await insertResponse.json();
      console.log(`Added ${data.length} default categories.`);
    } else {
      console.log('Categories already exist. Skipping default categories.');
    }

    console.log('Categories initialization complete!');
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Install node-fetch if needed
async function checkAndInstallDependencies() {
  try {
    require('node-fetch');
    console.log('node-fetch is already installed.');
    return true;
  } catch (error) {
    console.log('Installing node-fetch...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install node-fetch@2', { stdio: 'inherit' });
      console.log('node-fetch installed successfully.');
      return true;
    } catch (installError) {
      console.error('Failed to install node-fetch:', installError);
      return false;
    }
  }
}

// Run the function
(async () => {
  console.log('Starting categories initialization script...');
  const dependenciesInstalled = await checkAndInstallDependencies();
  console.log('Dependencies check completed:', dependenciesInstalled);
  if (dependenciesInstalled) {
    await initCategories();
  }
  console.log('Script execution completed.');
})();
