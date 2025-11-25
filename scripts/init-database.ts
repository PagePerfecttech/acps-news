import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function initializeDatabase() {
    console.log('🚀 Initializing ACPS News Database...\n');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { prepare: false });

    try {
        // Initialize site_settings table
        console.log('📝 Populating site_settings table...');

        const settingsData = [
            { key: 'site_name', value: 'ACPS News' },
            { key: 'primary_color', value: '#FACC15' },
            { key: 'secondary_color', value: '#000000' },
            { key: 'share_link', value: 'https://acps-news.vercel.app' },
            { key: 'logo_url', value: '' },
            { key: 'background_logo_url', value: '/logo-background.svg' },
            { key: 'background_logo_opacity', value: '0.1' },
            { key: 'black_strip_text', value: 'No.1 తెలుగు న్యూస్ డైలీ' },
            { key: 'admin_email', value: 'admin@acpsnews.com' },
            { key: 'admin_name', value: 'Admin' },
            { key: 'app_version', value: '1.0.0' }
        ];

        for (const setting of settingsData) {
            await sql`
                INSERT INTO site_settings (key, value, created_at, updated_at)
                VALUES (${setting.key}, ${setting.value}, NOW(), NOW())
                ON CONFLICT (key) DO UPDATE SET
                    value = ${setting.value},
                    updated_at = NOW()
            `;
        }

        console.log('✅ Site settings initialized successfully!');

        // Initialize ads table (using gen_random_uuid() for UUID generation)
        console.log('\n📝 Populating ads table...');

        const adsData = [
            {
                title: 'Premium News Subscription',
                description: 'Get unlimited access to all premium content',
                link_url: 'https://acps-news.vercel.app/subscribe',
                frequency: 5,
                active: true,
                image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'
            },
            {
                title: 'Breaking News Alerts',
                description: 'Never miss important updates with our mobile app',
                link_url: 'https://acps-news.vercel.app/app',
                frequency: 3,
                active: true,
                image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80'
            },
            {
                title: 'Support Quality Journalism',
                description: 'Help us keep news free and independent',
                link_url: 'https://acps-news.vercel.app/donate',
                frequency: 7,
                active: true,
                image_url: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80'
            },
            {
                title: 'Weekly Newsletter',
                description: 'Get the best stories delivered to your inbox',
                link_url: 'https://acps-news.vercel.app/newsletter',
                frequency: 10,
                active: true,
                image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'
            }
        ];

        for (const ad of adsData) {
            await sql`
                INSERT INTO ads (title, description, link_url, frequency, active, image_url, created_at, updated_at)
                VALUES (
                    ${ad.title}, 
                    ${ad.description}, 
                    ${ad.link_url}, 
                    ${ad.frequency}, 
                    ${ad.active}, 
                    ${ad.image_url}, 
                    NOW(), 
                    NOW()
                )
            `;
        }

        console.log('✅ Ads initialized successfully!');

        // Verify the data
        const settingsCount = await sql`SELECT COUNT(*) as count FROM site_settings`;
        const adsCount = await sql`SELECT COUNT(*) as count FROM ads`;

        console.log('\n📊 Database Status:');
        console.log(`  - Site Settings: ${settingsCount[0].count} records`);
        console.log(`  - Ads: ${adsCount[0].count} records`);
        console.log('\n✅ Database initialization complete!');

        await sql.end();

    } catch (error) {
        console.error('\n❌ Error initializing database:', error);
        await sql.end();
        process.exit(1);
    }
}

// Run the initialization
initializeDatabase();
