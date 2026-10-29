import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set');
}

export const db = drizzle(process.env.DATABASE_URL, { schema });
