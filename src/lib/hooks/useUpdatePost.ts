'use client';

import {
  type InfiniteData,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { HttpMethod } from '../enumerations';
import type {
  PostContext,
  PostInfiniteQuery,
  PostMutation,
  PostQuery,
  PostsContext,
  PostVariables,
  PostWithRelationsAndRelationCountsAndUserReaction,
} from '../types';

export const useUpdatePost = (
  queryKey: (string | number)[],
  pathname: string
): UseMutationResult<
  PostMutation,
  Error,
  PostVariables,
  PostContext | PostsContext
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: PostVariables): Promise<PostMutation> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: HttpMethod.PUT,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: PostMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async ({
      id,
      payload,
    }: PostVariables): Promise<PostContext | PostsContext | undefined> => {
      await queryClient.cancelQueries({ queryKey });

      if (pathname === '/' || pathname === '/search') {
        const previousPosts =
          queryClient.getQueryData<
            InfiniteData<PostInfiniteQuery, number | null>
          >(queryKey);

        queryClient.setQueryData(
          queryKey,
          // TODO
          (
            oldPosts: InfiniteData<PostInfiniteQuery, number | null> | undefined
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
                        return post?.id === id ? { ...post, ...payload } : post;
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
        const previousPost = queryClient.getQueryData<PostQuery>(queryKey);

        queryClient.setQueryData(
          queryKey,
          // TODO
          (oldPost: PostQuery | undefined) => {
            if (oldPost === undefined) {
              return oldPost;
            }

            return {
              ...oldPost,
              data: {
                ...oldPost.data,
                post: { ...oldPost.data?.post, ...payload },
              },
            };
          }
        );

        return { previousPost };
      }
    },
    onError: (
      _error,
      _variables,
      context: PostContext | PostsContext | undefined
    ): void => {
      if (
        context !== undefined &&
        'previousPosts' in context &&
        context.previousPosts !== undefined
      ) {
        queryClient.setQueryData(queryKey, context.previousPosts);
      }

      if (
        context !== undefined &&
        'previousPost' in context &&
        context.previousPost !== undefined
      ) {
        queryClient.setQueryData(queryKey, context.previousPost);
      }
    },
    onSettled: (): void => {
      queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
};
