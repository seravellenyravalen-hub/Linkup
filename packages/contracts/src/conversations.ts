import { z } from 'zod';

export const ConversationSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('direct'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateDirectConversationSchema = z.object({
  userId: z.string().min(1),
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type CreateDirectConversation = z.infer<typeof CreateDirectConversationSchema>;
