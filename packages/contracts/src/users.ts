import { z } from 'zod';

export const UsernameSchema = z.string().regex(/^[a-z0-9_]{3,30}$/, 'Username must be 3-30 characters using lowercase letters, numbers, or underscores.');

export const ProfileSchema = z.object({
  id: z.string().min(1),
  username: UsernameSchema,
  displayName: z.string().min(1).max(80),
  bio: z.string().max(280),
  avatarUrl: z.string().url().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;
