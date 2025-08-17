import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/database';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const readPostWithRelationsAndRelationCountsAndUserReaction = async (
  id: number,
  clerkUserId: string | null
) => {
  const response = await prisma.post.findUnique({
    where: { id },
    include: {
      user: true,
      originalPost: {
        include: { user: true },
      },
      _count: {
        select: {
          shares: true,
          comments: {
            where: { parentCommentId: null },
          },
          reactions: true,
          views: true,
        },
      },
      reactions: {
        where: { clerkUserId },
      },
    },
  });

  if (response === null) {
    return null;
  }

  const { reactions, ...responseWithoutReactions } = response;
  const userReaction = reactions[0] ?? null;

  return { ...responseWithoutReactions, userReaction };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const readCommentWithRelationsAndRelationCountsAndUserReaction = async (
  id: number,
  clerkUserId: string | null
) => {
  const response = await prisma.comment.findUnique({
    where: { id },
    include: {
      user: true,
      _count: {
        select: {
          replies: true,
          reactions: true,
        },
      },
      reactions: {
        where: { clerkUserId },
      },
    },
  });

  if (response === null) {
    return null;
  }

  const { reactions, ...responseWithoutReactions } = response;
  const userReaction = reactions[0] ?? null;

  return { ...responseWithoutReactions, userReaction };
};

export type PostWithRelationsAndRelationCountsAndUserReaction =
  Prisma.PromiseReturnType<
    typeof readPostWithRelationsAndRelationCountsAndUserReaction
  >;

export type CommentWithRelationsAndRelationCountsAndUserReaction =
  Prisma.PromiseReturnType<
    typeof readCommentWithRelationsAndRelationCountsAndUserReaction
  >;
