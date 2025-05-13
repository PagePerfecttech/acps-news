// This script initializes the categories table with default categories
require('dotenv').config();
const fetch = require('node-fetch');

// Supabase credentials
const supabaseUrl = 'https://tnaqvbrflguwpeafwclz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYXF2YnJmbGd1d3BlYWZ3Y2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzE3NDIsImV4cCI6MjA2MjU0Nzc0Mn0.wosmLe8bA0LOJQttRD03c7tIa8woLbFNSVWuc0ntcME';

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
