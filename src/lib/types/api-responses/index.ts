import {
  type Comment,
  type Post,
  type Reaction,
  type User,
  type View,
} from '@prisma/client';

import { ApiResponseDataKey } from '@/lib/enumerations';

import type {
  CommentWithRelationsAndRelationCountsAndUserReaction,
  PostWithRelationsAndRelationCountsAndUserReaction,
} from '../database-returns';

type ApiQueryResponse<Key extends string, Data> = {
  data: { [key in Key]: Data | null } | null;
  errors: { [key: string]: string[] } | null;
};

type ApiInfiniteQueryResponse<Key extends string, Data> = {
  data: ({ [key in Key]: Data[] } & { nextCursor: number | null }) | null;
  errors: { [key: string]: string[] } | null;
};

type ApiMutationResponse<Key extends string, Data> = {
  data: { [key in Key]: Data | null } | null;
  errors: { [key: string]: string[] } | null;
};

export type UserQuery = ApiQueryResponse<ApiResponseDataKey.USER, User>;

export type PostQuery = ApiQueryResponse<
  ApiResponseDataKey.POST,
  PostWithRelationsAndRelationCountsAndUserReaction
>;

export type PostInfiniteQuery = ApiInfiniteQueryResponse<
  ApiResponseDataKey.POSTS,
  PostWithRelationsAndRelationCountsAndUserReaction
>;

export type CommentInfiniteQuery = ApiInfiniteQueryResponse<
  ApiResponseDataKey.COMMENTS,
  CommentWithRelationsAndRelationCountsAndUserReaction
>;

export type PostMutation = ApiMutationResponse<ApiResponseDataKey.POST, Post>;

export type CommentMutation = ApiMutationResponse<
  ApiResponseDataKey.COMMENT,
  Comment
>;

export type ReactionMutation = ApiMutationResponse<
  ApiResponseDataKey.REACTION,
  Reaction
>;

export type ViewMutation = ApiMutationResponse<ApiResponseDataKey.VIEW, View>;
