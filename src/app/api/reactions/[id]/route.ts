import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { prisma } from '@/lib/database';
import { HttpMethod } from '@/lib/enumerations';
import { reactionSchema } from '@/lib/schemas';
import type { ReactionMutation, ReactionSchema } from '@/lib/types';
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
  HttpMethod.PUT,
  HttpMethod.DELETE,
  HttpMethod.OPTIONS,
].join(', ');

export const PUT = async (
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ReactionMutation>> => {
  const authenticateUserResult = await authenticateUser<ReactionMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = (await params).id;

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, reaction] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.reaction.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<ReactionMutation>(
      user,
      reaction,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = 500;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

    console.error(message, error);

    return responseWithCors<ReactionMutation>(
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

  const parsePayloadResult = await parsePayload<
    ReactionSchema,
    ReactionMutation
  >(request, reactionSchema, ALLOWED_METHODS);

  if (!parsePayloadResult.isParsed) {
    return parsePayloadResult.response;
  }

  try {
    const { parsedPayload } = parsePayloadResult;

    const response = await prisma.reaction.update({
      where: { id },
      data: parsedPayload,
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.postId}`);

    return responseWithCors<ReactionMutation>(
      new NextResponse(
        JSON.stringify({
          data: { reaction: response },
          errors: null,
        }),
        {
          status: 200,
          headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
        }
      )
    );
  } catch (error: unknown) {
    const status = 500;
    const message = API_RESPONSE_MESSAGES.updateReaction[status];

    console.error(message, error);

    return responseWithCors<ReactionMutation>(
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
): Promise<NextResponse<ReactionMutation>> => {
  const authenticateUserResult = await authenticateUser<ReactionMutation>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  const id = (await params).id;

  try {
    const { userId: clerkId } = authenticateUserResult;

    const [user, reaction] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId },
      }),
      prisma.reaction.findUnique({
        where: { id },
      }),
    ]);

    const authorizeUserResult = authorizeUser<ReactionMutation>(
      user,
      reaction,
      ALLOWED_METHODS
    );

    if (!authorizeUserResult.isAuthorized) {
      return authorizeUserResult.response;
    }
  } catch (error: unknown) {
    const status = 500;
    const message = API_RESPONSE_MESSAGES.authorizeUser[status];

    console.error(message, error);

    return responseWithCors<ReactionMutation>(
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
    const response = await prisma.reaction.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath(`/posts/${response.postId}`);

    return responseWithCors<ReactionMutation>(
      new NextResponse(
        JSON.stringify({
          data: { reaction: response },
          errors: null,
        }),
        {
          status: 200,
          headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
        }
      )
    );
  } catch (error: unknown) {
    const status = 500;
    const message = API_RESPONSE_MESSAGES.deleteReaction[status];

    console.error(message, error);

    return responseWithCors<ReactionMutation>(
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
      status: 204,
      headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
    })
  );
};
