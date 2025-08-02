import { NextResponse } from 'next/server';
import {
  type Comment,
  type Post,
  type Reaction,
  type User,
  UserRole,
} from '@prisma/client';

import { API_RESPONSE_MESSAGES } from '../constants';

import { responseWithCors } from './responseWithCors';

export const authorizeUser = <TResponse>(
  user: User | null,
  record: Comment | Post | Reaction | null,
  allowedMethods: string
):
  | { isAuthorized: true }
  | { response: NextResponse<TResponse>; isAuthorized: false } => {
  const isAnAdmin = user?.role === UserRole.ADMIN;
  const isAUser = user?.role === UserRole.USER;

  if (!(isAnAdmin || (isAUser && user?.clerkId === record?.clerkUserId))) {
    const status = 403;

    return {
      response: responseWithCors<TResponse>(
        new NextResponse(
          JSON.stringify({
            data: null,
            errors: { auth: [API_RESPONSE_MESSAGES.authorizeUser[status]] },
          }),
          {
            status,
            headers: { 'Access-Control-Allow-Methods': allowedMethods },
          }
        )
      ),
      isAuthorized: false,
    };
  }

  return { isAuthorized: true };
};
