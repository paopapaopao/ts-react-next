'use client';

import {
  type InfiniteData,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { HttpRequestMethod, QueryKey } from '../enumerations';
import type {
  CommentInfiniteQuery,
  CommentsContext,
  CommentWithRelationsAndRelationCountsAndUserReaction,
  PostContext,
  PostInfiniteQuery,
  PostQuery,
  PostQueryKeyParams,
  PostsContext,
  PostWithRelationsAndRelationCountsAndUserReaction,
  ReactionMutation,
  ReactionVariables,
} from '../types';

type TContext = CommentsContext | PostContext | PostsContext;

type Props = {
  postQueryKey: PostQueryKeyParams;
  pathname: string;
  commentQueryKey: (number | QueryKey | undefined)[];
};

export const useUpdateReaction = ({
  postQueryKey,
  pathname,
  commentQueryKey,
}: Props): UseMutationResult<
  ReactionMutation,
  Error,
  ReactionVariables,
  TContext
> => {
  const queryClient = useQueryClient();

  const queryKeyMap: Record<
    string,
    PostQueryKeyParams | (number | QueryKey | undefined)[]
  > = {
    previousPosts: postQueryKey,
    previousPost: postQueryKey,
    previousComments: commentQueryKey,
  };

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: ReactionVariables): Promise<ReactionMutation> => {
      const response = await fetch(`/api/reactions/${id}`, {
        method: HttpRequestMethod.PUT,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: ReactionMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async ({
      id,
      payload,
    }: ReactionVariables): Promise<TContext | undefined> => {
      const isPostReaction =
        payload.postId !== null && payload.commentId === null;

      if (isPostReaction) {
        await queryClient.cancelQueries({ queryKey: postQueryKey });

        if (pathname === '/' || pathname === '/search') {
          const previousPosts = queryClient.getQueryData<
            InfiniteData<PostInfiniteQuery, number | null>
          >([QueryKey.POSTS, postQueryKey]);

          queryClient.setQueryData(
            [QueryKey.POSTS, postQueryKey],
            // TODO
            (
              oldPosts:
                | InfiniteData<PostInfiniteQuery, number | null>
                | undefined
            ) => {
              if (oldPosts === undefined) {
                return oldPosts;
              }

              return {
                ...oldPosts,
                // TODO
                pages: oldPosts.pages.map((page: PostInfiniteQuery) => {
                  return {
                    ...page,
                    data: {
                      ...page.data,
                      // TODO
                      posts: page.data?.posts.map(
                        (
                          post: PostWithRelationsAndRelationCountsAndUserReaction
                        ) => {
                          if (
                            post?.userReaction?.id === id &&
                            post?.userId === payload.userId &&
                            post?.id === payload.postId
                          ) {
                            return {
                              ...post,
                              userReaction: {
                                ...post.userReaction,
                                ...payload,
                              },
                            };
                          }

                          return post;
                        }
                      ),
                    },
                  };
                }),
              };
            }
          );

          return { previousPosts };
        } else {
          const previousPost = queryClient.getQueryData<PostQuery>([
            QueryKey.POSTS,
            postQueryKey,
          ]);

          queryClient.setQueryData(
            [QueryKey.POSTS, postQueryKey],
            // TODO
            (oldPost: PostQuery | undefined) => {
              if (oldPost === undefined) {
                return oldPost;
              }

              return {
                ...oldPost,
                data: {
                  ...oldPost.data,
                  post: {
                    ...oldPost.data?.post,
                    userReaction: {
                      ...(oldPost.data?.post &&
                        'userReaction' in oldPost.data.post &&
                        oldPost.data.post.userReaction !== null && {
                          ...oldPost.data.post.userReaction,
                        }),
                      ...payload,
                    },
                  },
                },
              };
            }
          );

          return { previousPost };
        }
      } else {
        await queryClient.cancelQueries({ queryKey: commentQueryKey });

        const previousComments =
          queryClient.getQueryData<
            InfiniteData<CommentInfiniteQuery, number | null>
          >(commentQueryKey);

        queryClient.setQueryData(
          commentQueryKey,
          // TODO
          (
            oldComments:
              | InfiniteData<CommentInfiniteQuery, number | null>
              | undefined
          ) => {
            if (oldComments === undefined) {
              return oldComments;
            }

            return {
              ...oldComments,
              // TODO
              pages: oldComments.pages.map((page: CommentInfiniteQuery) => {
                return {
                  ...page,
                  data: {
                    ...page.data,
                    // TODO
                    comments: page.data?.comments.map(
                      (
                        comment: CommentWithRelationsAndRelationCountsAndUserReaction
                      ) => {
                        if (
                          comment?.userReaction?.id === id &&
                          comment?.userId === payload.userId &&
                          comment?.id === payload.commentId
                        ) {
                          return {
                            ...comment,
                            userReaction: {
                              ...comment.userReaction,
                              ...payload,
                            },
                          };
                        }

                        return comment;
                      }
                    ),
                  },
                };
              }),
            };
          }
        );

        return { previousComments };
      }
    },
    onError: (_error, _variables, context: TContext | undefined): void => {
      if (context !== undefined) {
        Object.entries(context).forEach(([key, value]) => {
          if (key in queryKeyMap && value !== undefined) {
            queryClient.setQueryData(
              Array.isArray(queryKeyMap[key])
                ? queryKeyMap[key]
                : [queryKeyMap[key]],
              value
            );
          }
        });
      }
    },
    onSettled: (
      _data,
      _error,
      _variables,
      context: TContext | undefined
    ): void => {
      if (context !== undefined) {
        Object.entries(context).forEach(([key, value]) => {
          if (key in queryKeyMap && value !== undefined) {
            queryClient.invalidateQueries({
              queryKey: queryKeyMap[key],
              exact: true,
            });
          }
        });
      }
    },
  });
};
