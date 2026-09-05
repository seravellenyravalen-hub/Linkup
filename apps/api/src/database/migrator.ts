import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PoolClient } from 'pg';
import { databasePool } from './database.pool';

const migrationsDirectory = join(dirname(fileURLToPath(import.meta.url)), '../../../../database/migrations');

export async function ensureMigrationTable(client: PoolClient): Promise<void> {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
}

export async function getAppliedMigrations(client: PoolClient): Promise<string[]> {
  await ensureMigrationTable(client);
  const result = await client.query<{ version: string }>('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map((row) => row.version);
}

export async function migrate(): Promise<string[]> {
  const client = await databasePool.connect();
  try {
    await ensureMigrationTable(client);
    const applied = new Set(await getAppliedMigrations(client));
    const files = (await readdir(migrationsDirectory)).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();

    for (const file of files) {
      const version = file.split('_', 1)[0];
      if (applied.has(version)) continue;
      const sql = await readFile(join(migrationsDirectory, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [version]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return getAppliedMigrations(client);
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('migrator.ts')) {
  migrate().then((versions) => console.log(`Applied migrations: ${versions.join(', ') || 'none'}`)).finally(() => databasePool.end());
}
