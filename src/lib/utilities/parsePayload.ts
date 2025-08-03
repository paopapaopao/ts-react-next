import { type NextRequest, NextResponse } from 'next/server';
import { type ZodSchema } from 'zod';

import { API_RESPONSE_MESSAGES } from '../constants';
import { HttpResponseStatusCode } from '../enumerations';

import { responseWithCors } from './responseWithCors';

export const parsePayload = async <TSchema, TResponse>(
  request: NextRequest,
  schema: ZodSchema<TSchema>,
  allowedMethods: string
): Promise<
  | { parsedPayload: TSchema; isParsed: true }
  | { response: NextResponse<TResponse>; isParsed: false }
> => {
  try {
    const payload: TSchema = await request.json();
    const parsedPayload = schema.safeParse(payload);

    return parsedPayload.success
      ? { parsedPayload: parsedPayload.data, isParsed: true }
      : {
          response: responseWithCors<TResponse>(
            new NextResponse(
              JSON.stringify({
                data: null,
                errors: parsedPayload.error?.flatten().fieldErrors,
              }),
              {
                status: HttpResponseStatusCode.BAD_REQUEST,
                headers: { 'Access-Control-Allow-Methods': allowedMethods },
              }
            )
          ),
          isParsed: false,
        };
  } catch (error: unknown) {
    const status = HttpResponseStatusCode.INTERNAL_SERVER_ERROR;
    const message = API_RESPONSE_MESSAGES.parsePayload[status];

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
      isParsed: false,
    };
  }
};
