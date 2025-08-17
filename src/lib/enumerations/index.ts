export enum HttpRequestMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

export enum HttpResponseStatusCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHENTICATED = 401,
  UNAUTHORIZED = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ApiResponseDataKey {
  USER = 'user',
  POST = 'post',
  COMMENT = 'comment',
  REACTION = 'reaction',
  VIEW = 'view',
  POSTS = 'posts',
  COMMENTS = 'comments',
}

export enum ApiReadResourceCount {
  POSTS = 8,
  COMMENTS = 4,
  REPLIES = 2,
}

export enum QueryKey {
  POSTS = 'posts',
  COMMENTS = 'comments',
  REPLIES = 'replies',
}

export enum QueryContextKey {
  POST = 'previousPost',
  POSTS = 'previousPosts',
  COMMENTS = 'previousComments',
}

export enum Mode {
  VIEW,
  EDIT,
}
