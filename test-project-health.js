// Comprehensive project health check
require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

console.log('🏥 Vizag News Project Health Check...\n');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const r2AccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const r2PublicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEnvironmentVariables() {
  console.log('🔧 Environment Variables Check:');
  
  const checks = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', value: supabaseUrl },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: supabaseKey },
    { name: 'CLOUDFLARE_R2_ACCESS_KEY_ID', value: r2AccessKey },
    { name: 'CLOUDFLARE_R2_SECRET_ACCESS_KEY', value: r2SecretKey },
    { name: 'CLOUDFLARE_R2_BUCKET_NAME', value: r2Bucket },
    { name: 'NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL', value: r2PublicUrl }
  ];
  
  let allConfigured = true;
  
  checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    console.log(`   ${status} ${check.name}: ${check.value ? 'Set' : 'Missing'}`);
    if (!check.value) allConfigured = false;
  });
  
  return allConfigured;
}

async function checkSupabaseTables() {
  console.log('\n📊 Supabase Tables Check:');
  
  const tables = ['news_articles', 'categories', 'ads'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        results[table] = false;
      } else {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`   ✅ ${table}: ${count || 0} records`);
        results[table] = true;
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      results[table] = false;
    }
  }
  
  return results;
}

async function checkAPIEndpoints() {
  console.log('\n🔌 API Endpoints Check:');
  
  const endpoints = [
    { name: 'News Articles', path: '/api/admin/news' },
    { name: 'Categories', path: '/api/admin/categories' },
    { name: 'Ads', path: '/api/admin/ads' },
    { name: 'Environment Check', path: '/api/env-check' },
    { name: 'R2 Upload', path: '/api/upload/r2' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.path}`);
      
      if (response.ok || response.status === 405) { // 405 = Method Not Allowed (expected for some endpoints)
        console.log(`   ✅ ${endpoint.name}: Available`);
        results[endpoint.name] = true;
      } else {
        console.log(`   ❌ ${endpoint.name}: Status ${response.status}`);
        results[endpoint.name] = false;
      }
    } catch (err) {
      console.log(`   ⚠️  ${endpoint.name}: Server not running`);
      results[endpoint.name] = 'server_down';
    }
  }
  
  return results;
}

async function checkCriticalFiles() {
  console.log('\n📁 Critical Files Check:');
  
  const files = [
    '.env.local',
    'package.json',
    'next.config.js',
    'vercel.json',
    'app/api/admin/news/route.ts',
    'app/api/admin/categories/route.ts',
    'app/api/admin/ads/route.ts',
    'app/api/upload/r2/route.ts',
    'app/lib/supabase.ts',
    'app/components/NewsCard.tsx',
    'app/components/ShareModal.tsx'
  ];
  
  let allExist = true;
  
  files.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${file}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

async function checkBrandingConsistency() {
  console.log('\n🏷️  Branding Consistency Check:');
  
  const filesToCheck = [
    'app/components/NewsCard.tsx',
    'app/components/ShareModal.tsx',
    'app/components/WhatsAppShareButton.tsx',
    'public/images/fallback-share-image.svg'
  ];
  
  let brandingIssues = [];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for old branding
      if (content.includes('FlipNews') || content.includes('flipnews.vercel.app')) {
        brandingIssues.push(file);
      }
    }
  });
  
  if (brandingIssues.length === 0) {
    console.log('   ✅ All branding updated to Vizag News');
    return true;
  } else {
    console.log('   ❌ Old branding found in:');
    brandingIssues.forEach(file => {
      console.log(`      - ${file}`);
    });
    return false;
  }
}

async function generateHealthReport() {
  console.log('\n📋 HEALTH REPORT SUMMARY:');
  console.log('=' .repeat(50));
  
  const envOk = await checkEnvironmentVariables();
  const tablesOk = await checkSupabaseTables();
  const apiOk = await checkAPIEndpoints();
  const filesOk = await checkCriticalFiles();
  const brandingOk = await checkBrandingConsistency();
  
  console.log('\n🎯 OVERALL STATUS:');
  
  // Environment
  console.log(`   🔧 Environment Variables: ${envOk ? '✅ GOOD' : '❌ ISSUES'}`);
  
  // Database
  const dbIssues = Object.values(tablesOk).filter(v => !v).length;
  console.log(`   📊 Database Tables: ${dbIssues === 0 ? '✅ GOOD' : `❌ ${dbIssues} ISSUES`}`);
  
  // API
  const apiIssues = Object.values(apiOk).filter(v => v !== true).length;
  const serverDown = Object.values(apiOk).some(v => v === 'server_down');
  if (serverDown) {
    console.log('   🔌 API Endpoints: ⚠️  SERVER NOT RUNNING');
  } else {
    console.log(`   🔌 API Endpoints: ${apiIssues === 0 ? '✅ GOOD' : `❌ ${apiIssues} ISSUES`}`);
  }
  
  // Files
  console.log(`   📁 Critical Files: ${filesOk ? '✅ GOOD' : '❌ MISSING FILES'}`);
  
  // Branding
  console.log(`   🏷️  Branding: ${brandingOk ? '✅ GOOD' : '❌ OLD BRANDING FOUND'}`);
  
  // Overall health score
  const totalChecks = 5;
  let passedChecks = 0;
  if (envOk) passedChecks++;
  if (dbIssues === 0) passedChecks++;
  if (!serverDown && apiIssues === 0) passedChecks++;
  if (filesOk) passedChecks++;
  if (brandingOk) passedChecks++;
  
  const healthScore = Math.round((passedChecks / totalChecks) * 100);
  
  console.log('\n🏥 HEALTH SCORE:');
  if (healthScore >= 90) {
    console.log(`   🎉 EXCELLENT: ${healthScore}% - Project is in great shape!`);
  } else if (healthScore >= 70) {
    console.log(`   ✅ GOOD: ${healthScore}% - Minor issues to address`);
  } else if (healthScore >= 50) {
    console.log(`   ⚠️  FAIR: ${healthScore}% - Several issues need attention`);
  } else {
    console.log(`   ❌ POOR: ${healthScore}% - Major issues require immediate attention`);
  }
  
  console.log('\n🚀 RECOMMENDATIONS:');
  if (!envOk) {
    console.log('   - Fix missing environment variables');
  }
  if (dbIssues > 0) {
    console.log('   - Check Supabase database tables and permissions');
  }
  if (serverDown) {
    console.log('   - Start development server: npm run dev');
  } else if (apiIssues > 0) {
    console.log('   - Check API endpoint implementations');
  }
  if (!filesOk) {
    console.log('   - Restore missing critical files');
  }
  if (!brandingOk) {
    console.log('   - Update remaining FlipNews references to Vizag News');
  }
  
  if (healthScore >= 90) {
    console.log('   🎯 Project is ready for production deployment!');
  }
}

async function main() {
  console.log('🚀 Starting Comprehensive Health Check...\n');
  
  try {
    await generateHealthReport();
  } catch (error) {
    console.error('\n💥 Health check failed:', error.message);
  }
  
  console.log('\n✨ Health check complete!');
}

main().catch(console.error);
