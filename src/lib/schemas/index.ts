import { z } from 'zod';
import { ReactionType } from '@prisma/client';

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Must be at least 1 character long' })
    .max(100, { message: 'Must be at most 100 characters long' })
    .nullable(),
  body: z
    .string()
    .trim()
    .min(1, { message: 'Must be at least 1 character long' })
    .max(1000, { message: 'Must be at most 1000 characters long' })
    .nullable(),
  userId: z.number().int().positive().finite(),
  clerkUserId: z.string().nullable(),
  originalPostId: z.number().int().positive().finite().nullable(),
  hasSharedPost: z.boolean(),
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: 'Must be at least 1 character long' })
    .max(1000, { message: 'Must be at most 1000 characters long' }),
  userId: z.number().int().positive().finite(),
  clerkUserId: z.string().nullable(),
  postId: z.number().int().positive().finite(),
  parentCommentId: z.number().int().positive().finite().nullable(),
});

export const reactionSchema = z.object({
  type: z.nativeEnum(ReactionType),
  userId: z.number().int().positive().finite(),
  clerkUserId: z.string().nullable(),
  postId: z.number().int().positive().finite().nullable(),
  commentId: z.number().int().positive().finite().nullable(),
});

export const viewSchema = z.object({
  userId: z.number().int().positive().finite(),
  postId: z.number().int().positive().finite(),
});
