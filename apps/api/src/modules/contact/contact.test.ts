import { describe, expect, it, vi } from 'vitest';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  it('stores and notifies a valid report', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'report-1', createdAt: new Date() });
    const send = vi.fn().mockResolvedValue(undefined);
    const service = new ContactService({ create }, { send });
    const report = await service.submit({ email: ' User@Example.com ', category: 'Bug report', subject: 'Crash', message: 'The app crashes.' });
    expect(report.id).toBe('report-1');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ email: 'user@example.com', subject: 'Crash' }));
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ id: 'report-1', email: 'user@example.com' }));
  });

  it('rejects invalid email and short message', async () => {
    const service = new ContactService({ create: vi.fn() }, { send: vi.fn() });
    await expect(service.submit({ email: 'bad', category: 'Other', subject: 'x', message: 'no' })).rejects.toThrow('Invalid contact report');
  });
});
