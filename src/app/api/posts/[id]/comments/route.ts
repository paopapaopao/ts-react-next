import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { database } from '@/lib/database';
import {
  ApiReadResourceCount,
  HttpRequestMethod,
  HttpResponseStatusCode,
} from '@/lib/enumerations';
import type { CommentInfiniteQuery } from '@/lib/types';
import { authenticateUser, responseWithCors } from '@/lib/utilities';

type Params = {
  params: Promise<{ id: string }>;
};

const ALLOWED_METHODS = [HttpRequestMethod.GET, HttpRequestMethod.OPTIONS].join(
  ', '
);

export const GET = async (
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<CommentInfiniteQuery>> => {
  const authenticateUserResult = await authenticateUser<CommentInfiniteQuery>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  try {
    const { userId } = authenticateUserResult;

    const searchParams = request.nextUrl.searchParams;
    const cursor = Number(searchParams.get('cursor'));
    const id = Number((await params).id);

    const response = await database.comment.findMany({
      ...(cursor > 0 && {
        cursor: { id: cursor },
        skip: 1,
      }),
      where: {
        postId: id,
        parentCommentId: null,
      },
      include: {
        user: true,
        _count: {
          select: {
            replies: true,
            reactions: true,
          },
        },
        reactions: {
          where: { clerkUserId: userId },
        },
      },
      take: ApiReadResourceCount.COMMENTS,
      orderBy: { createdAt: Prisma.SortOrder.asc },
    });

    // TODO
    const commentsWithUserReaction = response.map((comment) => {
      const { reactions, ...commentWithoutReactions } = comment;
      const userReaction = reactions[0] ?? null;

      return { ...commentWithoutReactions, userReaction };
    });

    const hasMore = commentsWithUserReaction.length > 0;

    return responseWithCors<CommentInfiniteQuery>(
      new NextResponse(
        JSON.stringify({
          data: {
            comments: commentsWithUserReaction,
            nextCursor: hasMore
              ? commentsWithUserReaction[commentsWithUserReaction.length - 1].id
              : null,
          },
          errors: null,
        }),
        {
          status: HttpResponseStatusCode.OK,
          headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
        }
      )
    );
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.readComments[status];

    console.error(message, error);

    return responseWithCors<CommentInfiniteQuery>(
      new NextResponse(
        JSON.stringify({
          data: null,
          errors: { server: [message] },
        }),
        {
          status,
          headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
        }
      )
    );
  }
};

export const OPTIONS = (): NextResponse<null> => {
  return responseWithCors<null>(
    new NextResponse(null, {
      status: HttpResponseStatusCode.NO_CONTENT,
      headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
    })
  );
};
