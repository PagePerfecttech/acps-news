import dotenv from 'dotenv';
import path from 'path';

// Load .env.local BEFORE importing db
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Now import db
import { eq } from 'drizzle-orm';

async function createAdminUser() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import('../app/lib/db');
    const { users } = await import('../app/lib/schema');

    try {
        console.log('👤 Creating admin user...\n');

        // Check if DATABASE_URL is set
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL is not set in .env.local');
            process.exit(1);
        }

        const adminEmail = 'admin@acpsnews.com';
        const adminName = 'Admin';
        const adminPassword = 'admin123'; // In a real app, this should be hashed

        // Check if admin user already exists
        const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, adminEmail))
            .limit(1);

        if (existingUser.length > 0) {
            console.log(`⚠️ Admin user already exists: ${adminEmail}`);
            console.log(`   ID: ${existingUser[0].id}`);
            process.exit(0);
        }

        // Insert admin user
        const result = await db.insert(users).values({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            bio: 'System Administrator',
            profile_pic: 'https://ui-avatars.com/api/?name=Admin&background=FACC15&color=000000'
        }).returning();

        console.log(`✅ Admin user created successfully!`);
        console.log(`   ID: ${result[0].id}`);
        console.log(`   Email: ${result[0].email}`);
        console.log(`   Role: ${result[0].role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();
