import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import { getDatabaseConfig } from './database.config';

const config = getDatabaseConfig();

export const databasePool = new Pool({
  connectionString: config.url,
  max: config.maxConnections,
  idleTimeoutMillis: config.idleTimeoutMs,
  connectionTimeoutMillis: config.connectionTimeoutMs,
  ssl: config.url.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<T>> {
  return databasePool.query<T>(text, values as unknown[] | undefined);
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await databasePool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
