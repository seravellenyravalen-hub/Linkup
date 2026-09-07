import type { Pool } from 'pg';

export type ContactReportInput = {
  userId?: string;
  name?: string;
  email: string;
  category: string;
  subject: string;
  message: string;
};

export class ContactReportRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: ContactReportInput): Promise<{ id: string; createdAt: Date }> {
    const result = await this.pool.query<{ id: string; created_at: Date }>(
      `INSERT INTO contact_reports (user_id, name, email, category, subject, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [input.userId ?? null, input.name ?? null, input.email, input.category, input.subject, input.message],
    );
    return { id: result.rows[0].id, createdAt: result.rows[0].created_at };
  }
}
