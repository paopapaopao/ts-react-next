import { type InfiniteData } from '@tanstack/react-query';

import { QueryContextKey } from '@/lib/enumerations';

import type {
  CommentInfiniteQuery,
  PostInfiniteQuery,
  PostQuery,
} from '../api-responses';
import type { CommentSchema, PostSchema, ReactionSchema } from '../schemas';

type Variables<Id, Payload> = {
  id: Id;
  payload: Payload;
};

type Context<Key extends string, Data> = { [key in Key]: Data | undefined };

export type PageParam = { pageParam: number | null };

export type PostVariables = Variables<number | undefined, PostSchema>;
export type CommentVariables = Variables<number | undefined, CommentSchema>;
export type ReactionVariables = Variables<string, ReactionSchema>;

export type PostContext = Context<QueryContextKey.POST, PostQuery>;

export type PostsContext = Context<
  QueryContextKey.POSTS,
  InfiniteData<PostInfiniteQuery, number | null>
>;

export type CommentsContext = Context<
  QueryContextKey.COMMENTS,
  InfiniteData<CommentInfiniteQuery, number | null>
>;
