import { type NextRequest, NextResponse } from 'next/server';

import { API_RESPONSE_MESSAGES } from '@/lib/constants';
import { database } from '@/lib/database';
import { HttpRequestMethod, HttpResponseStatusCode } from '@/lib/enumerations';
import type { UserQuery } from '@/lib/types';
import { authenticateUser, responseWithCors } from '@/lib/utilities';

type Params = {
  params: Promise<{ clerkId: string }>;
};

const ALLOWED_METHODS = [HttpRequestMethod.GET, HttpRequestMethod.OPTIONS].join(
  ', '
);

export const GET = async (
  _: NextRequest,
  { params }: Params
): Promise<NextResponse<UserQuery>> => {
  const authenticateUserResult = await authenticateUser<UserQuery>(
    ALLOWED_METHODS
  );

  if (!authenticateUserResult.isAuthenticated) {
    return authenticateUserResult.response;
  }

  try {
    const clerkId = (await params).clerkId;

    const response = await database.user.findUnique({
      where: { clerkId },
    });

    if (response === null) {
      return responseWithCors<UserQuery>(
        new NextResponse(
          JSON.stringify({
            data: { user: null },
            errors: null,
          }),
          {
            status: HttpResponseStatusCode.NOT_FOUND,
            headers: { 'Access-Control-Allow-Methods': ALLOWED_METHODS },
          }
        )
      );
    }

    return responseWithCors<UserQuery>(
      new NextResponse(
        JSON.stringify({
          data: { user: response },
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
    const message = API_RESPONSE_MESSAGES.readUser[status];

    console.error(message, error);

    return responseWithCors<UserQuery>(
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
