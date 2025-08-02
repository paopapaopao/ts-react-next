export const COMMENTS_READ_COUNT = 4;
export const POSTS_READ_COUNT = 8;
export const REPLIES_READ_COUNT = 2;

export const API_RESPONSE_MESSAGES = {
  authenticateUser: {
    401: 'User not authenticated',
    500: 'Authenticate user failed',
  },

  authorizeUser: {
    403: 'User not authorized',
    500: 'Authorize user failed',
  },

  parsePayload: { 500: 'Parse payload failed' },

  readUser: { 500: 'Read user failed' },

  createPost: { 500: 'Create post failed' },
  readPost: { 500: 'Read post failed' },
  readPosts: { 500: 'Read posts failed' },
  updatePost: { 500: 'Update post failed' },
  deletePost: { 500: 'Delete post failed' },

  createComment: { 500: 'Create comment failed' },
  readComments: { 500: 'Read comments failed' },
  updateComment: { 500: 'Update comment failed' },
  deleteComment: { 500: 'Delete comment failed' },
  readReplies: { 500: 'Read replies failed' },

  createReaction: { 500: 'Create reaction failed' },
  updateReaction: { 500: 'Update reaction failed' },
  deleteReaction: { 500: 'Delete reaction failed' },

  createView: { 500: 'Create view failed' },
} as const;
