import { drizzle } from 'drizzle-orm/better-sqlite3';

import { relations } from './relations.ts';

export const db = drizzle(process.env.DB_FILENAME!, { relations });
