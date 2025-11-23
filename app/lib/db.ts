import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// We don't throw an error here to allow build time execution without env vars
// but we log a warning if it's missing in runtime
if (!connectionString) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('DATABASE_URL is not defined');
    }
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString || 'postgres://postgres:postgres@localhost:5432/postgres', { prepare: false });
export const db = drizzle(client, { schema });
