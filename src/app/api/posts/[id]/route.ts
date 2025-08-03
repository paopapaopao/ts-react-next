import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/database';
import { HttpRequestMethod, HttpResponseStatusCode } from '@/lib/enumerations';
import { postSchema } from '@/lib/schemas';
import type { PostMutation, PostQuery, PostSchema } from '@/lib/types';
import {
  authenticateUser,
  authorizeUser,
  parsePayload,
  responseWithCors,
} from '@/lib/utilities';

type Params = {
  params: Promise<{ id: string }>;
};

const ALLOWED_METHODS = [
  HttpRequestMethod.GET,
  HttpRequestMethod.PUT,
  HttpRequestMethod.DELETE,
  HttpRequestMethod.OPTIONS,
].join(', ');

export const GET = async (
  _: NextRequest,
  { params }: Params
): Promise<NextResponse<PostQuery>> => {
  const authenticateUserResult = await authenticateUser<PostQuery>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  try {
    const { userId } = authenticateUserResult;

    const id = Number((await params).id);

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
          where: { clerkUserId: userId },
        },
      },
    });

    if (response === null) {
      return responseWithCors<PostQuery>(
        new NextResponse(
          JSON.stringify({
            data: { post: null },
            errors: null,
          }),
          {
            status: HttpResponseStatusCode.NOT_FOUND,
            headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
          }
        )
      );
    }

    const { reactions, ...responseWithoutReactions } = response;
    const userReaction = reactions[0] ?? null;

    return responseWithCors<PostQuery>(
      new NextResponse(
        JSON.stringify({
          data: {
            post: { ...responseWithoutReactions, userReaction },
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
    const message = API_RESPONSE_MESSAGES.readPost[status];

    console.error(message, error);

    return responseWithCors<PostQuery>(
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

export const PUT = async (
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<PostMutation>> => {
  const authenticateUserResult = await authenticateUser<PostMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = Number((await params).id);

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, post] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.post.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<PostMutation>(
      user,
      post,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

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

    const response = await prisma.post.update({
      where: { id },
      data: parsedPayload,
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.id}`);

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
    const message = API_RESPONSE_MESSAGES.updatePost[status];

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

export const DELETE = async (
  _: NextRequest,
  { params }: Params
): Promise<NextResponse<PostMutation>> => {
  const authenticateUserResult = await authenticateUser<PostMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = Number((await params).id);

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, post] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.post.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<PostMutation>(
      user,
      post,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

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

  try {
    const response = await prisma.post.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.id}`);

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
    const message = API_RESPONSE_MESSAGES.deletePost[status];

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

export const OPTIONS = (): NextResponse<null> => {
  return responseWithCors<null>(
    new NextResponse(null, {
      status: HttpResponseStatusCode.NO_CONTENT,
      headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
    })
  );
};
