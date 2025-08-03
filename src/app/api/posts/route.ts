import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { API_RESPONSE_MESSAGES, POSTS_READ_COUNT } from '@/lib/constants';
import { prisma } from '@/lib/database';
import { HttpRequestMethod, HttpResponseStatusCode } from '@/lib/enumerations';
import { postSchema } from '@/lib/schemas';
import type { PostInfiniteQuery, PostMutation, PostSchema } from '@/lib/types';
import {
  authenticateUser,
  parsePayload,
  responseWithCors,
} from '@/lib/utilities';

const ALLOWED_METHODS = [
  HttpRequestMethod.POST,
  HttpRequestMethod.GET,
  HttpRequestMethod.OPTIONS,
].join(', ');

export const POST = async (
  request: NextRequest
): Promise<NextResponse<PostMutation>> => {
  const authenticateUserResult = await authenticateUser<PostMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const parsePayloadResult = await parsePayload<PostSchema, PostMutation>(
    request,
    postSchema,
    ALLOWED_METHODS
  );

  if (!parsePayloadResult.isParsed) {
    return parsePayloadResult.response;
  }

  try {
    const { parsedPayload } = parsePayloadResult;

    const response = await prisma.post.create({
      data: parsedPayload,
    });

    revalidatePath('/');

    return responseWithCors<PostMutation>(
      new NextResponse(
        JSON.stringify({
          data: { post: response },
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
    const message = API_RESPONSE_MESSAGES.createPost[status];

    console.error(message, error);

    return responseWithCors<PostMutation>(
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

// TODO Add support for searching 'null'
export const GET = async (
  request: NextRequest
): Promise<NextResponse<PostInfiniteQuery>> => {
  const authenticateUserResult = await authenticateUser<PostInfiniteQuery>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  try {
    const { userId: clerkUserId } = authenticateUserResult;

    const searchParams = request.nextUrl.searchParams;
    const rawUserId = Number(searchParams.get('userId'));
    const rawClerkUserId = searchParams.get('clerkUserId');
    const rawQuery = searchParams.get('query');
    const cursor = Number(searchParams.get('cursor'));

    const userIdParam = rawUserId > 0 ? rawUserId : null;

    const clerkUserIdParam =
      rawClerkUserId !== null &&
      rawClerkUserId.trim() !== '' &&
      rawClerkUserId !== 'null'
        ? rawClerkUserId
        : null;

    const queryParam =
      rawQuery !== null && rawQuery.trim() !== '' && rawQuery !== 'null'
        ? rawQuery
        : null;

    const response = await prisma.post.findMany({
      ...(cursor > 0 && {
        cursor: { id: cursor },
        skip: 1,
      }),
      where: {
        ...(userIdParam !== null && { userId: rawUserId }),
        ...(clerkUserIdParam !== null && { clerkUserId: clerkUserIdParam }),
        ...(queryParam !== null && {
          OR: [
            {
              title: { contains: String(queryParam) },
              body: { contains: String(queryParam) },
            },
          ],
        }),
      },
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
      take: POSTS_READ_COUNT,
      orderBy: { updatedAt: Prisma.SortOrder.desc },
    });

    // TODO
    const postsWithUserReaction = response.map((post) => {
      const { reactions, ...postWithoutReactions } = post;
      const userReaction = reactions[0] ?? null;

      return { ...postWithoutReactions, userReaction };
    });

    const hasMore = postsWithUserReaction.length > 0;

    return responseWithCors<PostInfiniteQuery>(
      new NextResponse(
        JSON.stringify({
          data: {
            posts: postsWithUserReaction,
            nextCursor: hasMore
              ? postsWithUserReaction[postsWithUserReaction.length - 1].id
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
    const message = API_RESPONSE_MESSAGES.readPosts[status];

    console.error(message, error);

    return responseWithCors<PostInfiniteQuery>(
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
