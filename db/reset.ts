import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const sqliteDbPath = resolve(process.env.SQLITE_DB_PATH ?? 'sqlite.db');
const sqliteSidecars = [`${sqliteDbPath}-wal`, `${sqliteDbPath}-shm`];

async function main() {
  await Promise.all(
    [sqliteDbPath, ...sqliteSidecars].map(async (filePath) => {
      await rm(filePath, { force: true });
    })
  );

  console.log(`Reset SQLite database target at ${sqliteDbPath}`);
}

main().catch((error) => {
  console.error('Failed to reset SQLite database target.', error);
  process.exitCode = 1;
});
