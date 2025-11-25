import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testWatermark() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { prepare: false });

    try {
        console.log('🔍 Checking Watermark Configuration...\n');

        // Get watermark settings
        const settings = await sql`
            SELECT * FROM site_settings 
            WHERE key IN ('background_logo_url', 'background_logo_opacity')
            ORDER BY key
        `;

        console.log('📊 Current Settings:');
        settings.forEach(s => {
            console.log(`  ${s.key}: ${s.value}`);
        });

        // Test if URL is accessible
        console.log('\n🌐 Testing watermark URL accessibility...');
        const watermarkUrl = settings.find(s => s.key === 'background_logo_url')?.value;

        if (watermarkUrl) {
            try {
                const response = await fetch(watermarkUrl);
                if (response.ok) {
                    console.log(`✅ Watermark URL is accessible (${response.status} ${response.statusText})`);
                    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
                    console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
                } else {
                    console.log(`❌ Watermark URL returned error: ${response.status} ${response.statusText}`);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.log(`❌ Failed to fetch watermark: ${errorMessage}`);
            }
        } else {
            console.log('❌ No watermark URL found in settings');
        }

        console.log('\n💡 Implementation Notes:');
        console.log('   - NewsCard uses CSS variables: --background-logo-url and --background-logo-opacity');
        console.log('   - News detail page uses inline styles with settings.background_logo_url');
        console.log('   - CSS class .content-with-logo-bg uses these CSS variables');
        console.log('\n📝 Make sure to:');
        console.log('   1. Clear browser cache');
        console.log('   2. Reload the application');
        console.log('   3. Check browser console for any CORS errors');

        await sql.end();

    } catch (error) {
        console.error('❌ Error:', error);
        await sql.end();
        process.exit(1);
    }
}

testWatermark();
