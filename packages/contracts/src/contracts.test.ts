import { describe, expect, it } from 'vitest';
import { ErrorResponseSchema, MessageSchema, RegisterSchema, RealtimeEventName, SendMessageSchema, UsernameSchema } from './index.js';

describe('LinkUp contracts', () => {
  it('accepts a valid registration payload', () => {
    expect(RegisterSchema.parse({ email: 'user@example.com', password: 'long-secure-password' }).email).toBe('user@example.com');
  });

  it('rejects a weak password', () => {
    expect(() => RegisterSchema.parse({ email: 'user@example.com', password: 'short' })).toThrow();
  });

  it('normalizes the contract expectation for usernames', () => {
    expect(UsernameSchema.safeParse('linkup_user').success).toBe(true);
    expect(UsernameSchema.safeParse('LinkUp User').success).toBe(false);
  });

  it('validates an outgoing message', () => {
    const result = SendMessageSchema.parse({ conversationId: 'c1', clientMessageId: 'client-1', type: 'text', text: 'Hello' });
    expect(result.type).toBe('text');
  });

  it('validates an authoritative message', () => {
    const result = MessageSchema.parse({ conversationId: 'c1', clientMessageId: 'client-1', type: 'text', text: 'Hello', id: 'm1', senderId: 'u1', createdAt: '2026-09-05T12:00:00.000Z', deletedAt: null });
    expect(result.id).toBe('m1');
  });

  it('exposes the required realtime event names', () => {
    expect(Object.keys(RealtimeEventName)).toHaveLength(8);
    expect(RealtimeEventName.MESSAGE_CREATED).toBe('message.created');
    expect(RealtimeEventName.SYNC_REQUIRED).toBe('sync.required');
  });

  it('requires request ids in errors', () => {
    expect(ErrorResponseSchema.safeParse({ code: 'FORBIDDEN', message: 'No access', requestId: 'req-1' }).success).toBe(true);
  });
});
