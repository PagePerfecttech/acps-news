// Script to fix all FlipNews branding and localStorage keys
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing FlipNews branding and localStorage keys...\n');

// Function to replace content in a file
function replaceInFile(filePath, replacements) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(from, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, to);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Define all the replacements needed
const replacements = [
  // localStorage keys
  { from: 'flipnews_articles', to: 'vizagnews_articles' },
  { from: 'flipnews_ads', to: 'vizagnews_ads' },
  { from: 'flipnews_categories', to: 'vizagnews_categories' },
  { from: 'flipnews_settings', to: 'vizagnews_settings' },
  
  // Branding replacements
  { from: 'FlipNews', to: 'Vizag News' },
  { from: 'FlipNEWS', to: 'Vizag News' },
  { from: 'flipnews', to: 'vizagnews' },
  { from: 'FLIPNEWS', to: 'VIZAGNEWS' },
  
  // URL replacements
  { from: 'https://flipnews\\.vercel\\.app', to: 'https://vizag-news.vercel.app' },
  { from: 'flipnews\\.vercel\\.app', to: 'vizag-news.vercel.app' },
  
  // Email replacements
  { from: 'admin@flipnews\\.com', to: 'admin@vizagnews.com' },
];

// Files to update
const filesToUpdate = [
  'app/lib/dataService.ts',
  'app/lib/settingsService.ts',
  'PROJECT.md',
  'SECURITY_FIXES.md',
  'scripts/create_tables.sql',
  'flipnews_schema.sql',
  'supabase/schema.sql',
  'supabase/rss_schema.sql',
  'supabase/migrations/20240510_add_site_settings.sql',
  'add_rss_feed.js'
];

// Process each file
let totalUpdated = 0;
filesToUpdate.forEach(file => {
  if (replaceInFile(file, replacements)) {
    totalUpdated++;
  }
});

console.log(`\n🎉 Branding fix complete!`);
console.log(`📊 Updated ${totalUpdated} files`);
console.log(`\n📋 Summary of changes:`);
console.log(`  ✅ localStorage keys: flipnews_* → vizagnews_*`);
console.log(`  ✅ Branding: FlipNews → Vizag News`);
console.log(`  ✅ URLs: flipnews.vercel.app → vizag-news.vercel.app`);
console.log(`  ✅ Emails: admin@flipnews.com → admin@vizagnews.com`);
