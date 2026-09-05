export type DatabaseConfig = {
  url: string;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
};

export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const url = env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required');

  const maxConnections = Number(env.DATABASE_POOL_MAX ?? 10);
  const idleTimeoutMs = Number(env.DATABASE_IDLE_TIMEOUT_MS ?? 30_000);
  const connectionTimeoutMs = Number(env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10_000);

  if (![maxConnections, idleTimeoutMs, connectionTimeoutMs].every(Number.isFinite)) {
    throw new Error('Database pool settings must be finite numbers');
  }
  if (maxConnections < 1 || maxConnections > 100) throw new Error('DATABASE_POOL_MAX must be between 1 and 100');

  return { url, maxConnections, idleTimeoutMs, connectionTimeoutMs };
}
