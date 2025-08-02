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
} from '../action-returns';

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

export type PostQuery = ApiQueryResponse<
  ApiResponseDataKey.Post,
  PostWithRelationsAndRelationCountsAndUserReaction
>;

export type UserQuery = ApiQueryResponse<ApiResponseDataKey.User, User>;

export type CommentInfiniteQuery = ApiInfiniteQueryResponse<
  ApiResponseDataKey.Comments,
  CommentWithRelationsAndRelationCountsAndUserReaction
>;

export type PostInfiniteQuery = ApiInfiniteQueryResponse<
  ApiResponseDataKey.Posts,
  PostWithRelationsAndRelationCountsAndUserReaction
>;

export type CommentMutation = ApiMutationResponse<
  ApiResponseDataKey.Comment,
  Comment
>;

export type PostMutation = ApiMutationResponse<ApiResponseDataKey.Post, Post>;

export type ReactionMutation = ApiMutationResponse<
  ApiResponseDataKey.Reaction,
  Reaction
>;

export type ViewMutation = ApiMutationResponse<ApiResponseDataKey.View, View>;
