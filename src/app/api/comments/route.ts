import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/database';
import { HttpMethod, HttpResponseStatusCode } from '@/lib/enumerations';
import { commentSchema } from '@/lib/schemas';
import type { CommentMutation, CommentSchema } from '@/lib/types';
import {
  authenticateUser,
  parsePayload,
  responseWithCors,
} from '@/lib/utilities';

const ALLOWED_METHODS = [HttpMethod.POST, HttpMethod.OPTIONS].join(', ');

export const POST = async (
  request: NextRequest
): Promise<NextResponse<CommentMutation>> => {
  const authenticateUserResult = await authenticateUser<CommentMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
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

    const response = await prisma.comment.create({
      data: parsedPayload,
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response?.postId}`);

    return responseWithCors<CommentMutation>(
      new NextResponse(
        JSON.stringify({
          data: { comment: response },
          errors: null,
        }),
        {
          status: HttpResponseStatusCode.Ok,
          headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
        }
      )
    );
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.InternalServerError;
    const message = API_RESPONSE_MESSAGES.createComment[status];

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
      status: HttpResponseStatusCode.NoContent,
      headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
    })
  );
};
