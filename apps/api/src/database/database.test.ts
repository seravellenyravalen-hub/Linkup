import { describe, expect, it } from 'vitest';
import { query } from './database.pool';

const integration = Boolean(process.env.DATABASE_URL);

describe.skipIf(!integration)('LinkUp PostgreSQL foundation', () => {
  it('has the required core tables', async () => {
    const result = await query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY($1::text[])
      ORDER BY table_name
    `, [[
      'users','profiles','devices','sessions','conversations','conversation_members',
      'messages','message_status','blocks','reports','notifications','settings','security_events','schema_migrations'
    ]]);

    expect(result.rows.map((row) => row.table_name)).toHaveLength(14);
  });

  it('enforces case-insensitive username uniqueness', async () => {
    const result = await query<{ indexname: string }>(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = 'profiles_username_unique_idx'
    `);
    expect(result.rows).toHaveLength(1);
  });

  it('has message idempotency and cursor indexes', async () => {
    const result = await query<{ indexname: string }>(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = ANY($1::text[])
      ORDER BY indexname
    `, [['messages_sender_client_id_unique_idx','messages_conversation_created_idx']]);
    expect(result.rows.map((row) => row.indexname)).toEqual([
      'messages_conversation_created_idx','messages_sender_client_id_unique_idx'
    ]);
  });
});
