const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const Database = require('better-sqlite3');

const repoRoot = resolve(__dirname, '..');
const databasePath = resolve(repoRoot, process.env.SQLITE_DB_PATH ?? 'sqlite.db');

function runOrExit(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function hasSeededData(dbPath) {
  if (!existsSync(dbPath)) {
    return false;
  }

  let sqlite;

  try {
    sqlite = new Database(dbPath, { fileMustExist: true });

    const outletsTable = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get('outlets');

    if (!outletsTable) {
      return false;
    }

    const outletCount = sqlite.prepare('SELECT COUNT(*) AS count FROM outlets').get();
    return Number(outletCount?.count ?? 0) > 0;
  } catch (error) {
    console.warn(
      `[render-start] Unable to inspect SQLite at ${dbPath}. Reinitializing before boot.`,
      error
    );
    return false;
  } finally {
    sqlite?.close();
  }
}

console.log(`[render-start] Using SQLite database at ${databasePath}`);

console.log('[render-start] Applying schema changes...');
runOrExit('npm', ['run', 'db:push']);

if (hasSeededData(databasePath)) {
  console.log('[render-start] Existing data detected. Skipping demo seed.');
} else {
  console.log('[render-start] Empty database detected. Seeding demo data...');
  runOrExit('npm', ['run', 'db:seed']);
}

console.log('[render-start] Starting Bhukkad server...');

const server = spawn('node', ['dist/server.js'], {
  cwd: repoRoot,
  env: process.env,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => {
    if (!server.killed) {
      server.kill(signal);
    }
  });
}

server.on('exit', (code) => {
  process.exit(code ?? 0);
});

server.on('error', (error) => {
  console.error('[render-start] Failed to start Bhukkad server.', error);
  process.exit(1);
});
