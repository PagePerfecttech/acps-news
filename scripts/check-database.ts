import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { prepare: false });

    try {
        console.log('📊 Checking Database Tables...\n');

        // Check site_settings table
        console.log('🔍 Site Settings Table:');
        console.log('─'.repeat(80));
        const settings = await sql`SELECT * FROM site_settings ORDER BY key`;

        if (settings.length === 0) {
            console.log('❌ No data found in site_settings table');
        } else {
            settings.forEach(row => {
                console.log(`  ${String(row.key).padEnd(30)} | ${row.value}`);
            });
            console.log(`\n  Total: ${settings.length} records\n`);
        }

        // Check ads table
        console.log('🔍 Ads Table:');
        console.log('─'.repeat(80));
        const ads = await sql`SELECT id, title, description, link_url, frequency, active FROM ads ORDER BY id`;

        if (ads.length === 0) {
            console.log('❌ No data found in ads table');
        } else {
            ads.forEach(ad => {
                console.log(`  ID: ${ad.id}`);
                console.log(`  Title: ${ad.title}`);
                console.log(`  Description: ${ad.description}`);
                console.log(`  Link: ${ad.link_url}`);
                console.log(`  Frequency: Every ${ad.frequency} articles`);
                console.log(`  Active: ${ad.active ? '✅ Yes' : '❌ No'}`);
                console.log('  ' + '─'.repeat(76));
            });
            console.log(`\n  Total: ${ads.length} ads\n`);
        }

        await sql.end();

    } catch (error) {
        console.error('❌ Error checking database:', error);
        await sql.end();
        process.exit(1);
    }
}

checkDatabase();
