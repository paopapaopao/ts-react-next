'use server';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { API_RESPONSE_MESSAGES } from '../constants';
import { HttpResponseStatusCode } from '../enumerations';

import { responseWithCors } from './responseWithCors';

export const authenticateUser = async <TResponse>(
  allowedMethods: string
): Promise<
  | { userId: string; isAuthenticated: true }
  | { response: NextResponse<TResponse>; isAuthenticated: false }
> => {
  try {
    const { userId } = await auth();

    if (userId === null) {
      const status = HttpResponseStatusCode.UNAUTHENTICATED;

      return {
        response: responseWithCors<TResponse>(
          new NextResponse(
            JSON.stringify({
              data: null,
              errors: {
                auth: [API_RESPONSE_MESSAGES.authenticateUser[status]],
              },
            }),
            {
              status,
              headers: { 'Access-Control-Allow-Methods': allowedMethods },
            }
          )
        ),
        isAuthenticated: false,
      };
    }

    return { userId, isAuthenticated: true };
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.authenticateUser[status];

    console.error(message, error);

    return {
      response: responseWithCors<TResponse>(
        new NextResponse(
          JSON.stringify({
            data: null,
            errors: { server: [message] },
          }),
          {
            status,
            headers: { 'Access-Control-Allow-Methods': allowedMethods },
          }
        )
      ),
      isAuthenticated: false,
    };
  }
};
