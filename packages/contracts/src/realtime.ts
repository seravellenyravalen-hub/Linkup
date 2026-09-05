import { z } from 'zod';

export const RealtimeEventName = {
  MESSAGE_CREATED: 'message.created',
  MESSAGE_DELIVERED: 'message.delivered',
  MESSAGE_READ: 'message.read',
  MESSAGE_DELETED: 'message.deleted',
  TYPING_STARTED: 'typing.started',
  TYPING_STOPPED: 'typing.stopped',
  PRESENCE_CHANGED: 'presence.changed',
  SYNC_REQUIRED: 'sync.required',
} as const;

export const MessageEventSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const TypingEventSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  occurredAt: z.string().datetime(),
});

export const PresenceChangedSchema = z.object({
  userId: z.string().min(1),
  online: z.boolean(),
  lastSeenAt: z.string().datetime().nullable(),
});

export const SyncRequiredSchema = z.object({
  cursor: z.string().min(1).nullable(),
});

export type MessageEvent = z.infer<typeof MessageEventSchema>;
export type TypingEvent = z.infer<typeof TypingEventSchema>;
export type PresenceChanged = z.infer<typeof PresenceChangedSchema>;
export type SyncRequired = z.infer<typeof SyncRequiredSchema>;
