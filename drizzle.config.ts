import { defineConfig } from 'drizzle-kit';

const sqliteDbPath = process.env.SQLITE_DB_PATH ?? './sqlite.db';

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: sqliteDbPath,
  },
});
