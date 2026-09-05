import { z } from 'zod';

export const MessageTypeSchema = z.enum(['text', 'image', 'video', 'voice', 'file']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1),
  clientMessageId: z.string().min(1).max(128),
  type: MessageTypeSchema,
  text: z.string().max(10000).optional(),
  attachmentIds: z.array(z.string().min(1)).max(16).optional(),
  replyToMessageId: z.string().min(1).nullable().optional(),
});

export const MessageSchema = SendMessageSchema.extend({
  id: z.string().min(1),
  senderId: z.string().min(1),
  createdAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

export type SendMessage = z.infer<typeof SendMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;
