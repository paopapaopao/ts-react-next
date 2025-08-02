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
  PostsContext,
  PostWithRelationsAndRelationCountsAndUserReaction,
  ReactionMutation,
  ReactionSchema,
} from '../types';

type TContext = CommentsContext | PostContext | PostsContext;

type Props = {
  postQueryKey: (string | number)[];
  pathname: string;
  commentQueryKey: (number | QueryKey | undefined)[];
};

export const useCreateReaction = ({
  postQueryKey,
  pathname,
  commentQueryKey,
}: Props): UseMutationResult<
  ReactionMutation,
  Error,
  ReactionSchema,
  TContext
> => {
  const queryClient = useQueryClient();

  const queryKeyMap: Record<
    string,
    (string | number)[] | (number | QueryKey | undefined)[]
  > = {
    previousPosts: postQueryKey,
    previousPost: postQueryKey,
    previousComments: commentQueryKey,
  };

  return useMutation({
    mutationFn: async (payload: ReactionSchema): Promise<ReactionMutation> => {
      const response = await fetch('/api/reactions', {
        method: HttpRequestMethod.POST,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: ReactionMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      payload: ReactionSchema
    ): Promise<TContext | undefined> => {
      const isPostReaction =
        payload.postId !== null && payload.commentId === null;

      const reaction = {
        ...payload,
        id: String(new Date()),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isPostReaction) {
        await queryClient.cancelQueries({ queryKey: postQueryKey });

        if (pathname === '/' || pathname === '/search') {
          const previousPosts =
            queryClient.getQueryData<
              InfiniteData<PostInfiniteQuery, number | null>
            >(postQueryKey);

          queryClient.setQueryData(
            postQueryKey,
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
                            post?.userId === reaction.userId &&
                            post?.id === reaction.postId
                          ) {
                            return { ...post, userReaction: reaction };
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
          const previousPost =
            queryClient.getQueryData<PostQuery>(postQueryKey);

          queryClient.setQueryData(
            postQueryKey,
            // TODO
            (oldPost: PostQuery | undefined) => {
              if (oldPost === undefined) {
                return oldPost;
              }

              return {
                ...oldPost,
                data: {
                  ...oldPost.data,
                  post: { ...oldPost.data?.post, userReaction: reaction },
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
                          comment?.userId === reaction.userId &&
                          comment?.id === reaction.commentId
                        ) {
                          return {
                            ...comment,
                            userReaction: reaction,
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
    onError: (_error, _payload, context: TContext | undefined): void => {
      if (context !== undefined) {
        Object.entries(context).forEach(([key, value]) => {
          if (key in queryKeyMap && value !== undefined) {
            queryClient.setQueryData(queryKeyMap[key], value);
          }
        });
      }
    },
    onSettled: (
      _data,
      _error,
      _payload,
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
