import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/database';
import { HttpRequestMethod, HttpResponseStatusCode } from '@/lib/enumerations';
import { commentSchema } from '@/lib/schemas';
import type { CommentMutation, CommentSchema } from '@/lib/types';
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
  HttpRequestMethod.PUT,
  HttpRequestMethod.DELETE,
  HttpRequestMethod.OPTIONS,
].join(', ');

export const PUT = async (
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<CommentMutation>> => {
  const authenticateUserResult = await authenticateUser<CommentMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = Number((await params).id);

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, comment] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.comment.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<CommentMutation>(
      user,
      comment,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

    console.error(message, error);

    return responseWithCors<CommentMutation>(
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

  const parsePayloadResult = await parsePayload<CommentSchema, CommentMutation>(
    request,
    commentSchema,
    ALLOWED_METHODS
  );

  if (!parsePayloadResult.isParsed) {
    return parsePayloadResult.response;
  }

  try {
    const { parsedPayload } = parsePayloadResult;

    const response = await prisma.comment.update({
      where: { id },
      data: parsedPayload,
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.postId}`);

    return responseWithCors<CommentMutation>(
      new NextResponse(
        JSON.stringify({
          data: { comment: response },
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
    const message = API_RESPONSE_MESSAGES.updateComment[status];

    console.error(message, error);

    return responseWithCors<CommentMutation>(
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
): Promise<NextResponse<CommentMutation>> => {
  const authenticateUserResult = await authenticateUser<CommentMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = Number((await params).id);

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, comment] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.comment.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<CommentMutation>(
      user,
      comment,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

    console.error(message, error);

    return responseWithCors<CommentMutation>(
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
    const response = await prisma.comment.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.postId}`);

    return responseWithCors<CommentMutation>(
      new NextResponse(
        JSON.stringify({
          data: { comment: response },
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
    const message = API_RESPONSE_MESSAGES.deleteComment[status];

    console.error(message, error);

    return responseWithCors<CommentMutation>(
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
