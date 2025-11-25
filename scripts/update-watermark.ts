import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function updateWatermark() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL, { prepare: false });

    try {
        // URL-encoded version of the watermark URL (fixing the space issue)
        const watermarkUrl = 'https://pub-e7ff7485d109499f9164e5959b53f7dc.r2.dev/site-assets/WhatsApp%20Image%202025-11-25%20at%2011.33.01.png';

        console.log('🔧 Updating watermark settings...\n');

        // Update background_logo_url
        await sql`
            UPDATE site_settings 
            SET value = ${watermarkUrl}, updated_at = NOW()
            WHERE key = 'background_logo_url'
        `;

        console.log('✅ Watermark URL updated successfully!\n');

        // Verify the update
        const settings = await sql`
            SELECT * FROM site_settings 
            WHERE key IN ('background_logo_url', 'background_logo_opacity')
        `;

        console.log('📊 Current Watermark Settings:');
        settings.forEach(s => {
            console.log(`  ${s.key}: ${s.value}`);
        });

        await sql.end();

    } catch (error) {
        console.error('❌ Error:', error);
        await sql.end();
        process.exit(1);
    }
}

updateWatermark();
