export enum HttpMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export enum HttpResponseStatusCode {
  Ok = 200,
  NoContent = 204,
  BadRequest = 400,
  Unauthenticated = 401,
  Unauthorized = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export enum QueryKey {
  POSTS = 'POSTS',
  COMMENTS = 'COMMENTS',
  REPLIES = 'REPLIES',
}

export enum Mode {
  VIEW,
  EDIT,
}
