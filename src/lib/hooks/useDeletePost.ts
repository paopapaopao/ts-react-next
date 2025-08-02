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
  PostWithRelationsAndRelationCountsAndUserReaction,
} from '../types';

export const useDeletePost = (
  queryKey: (string | number)[],
  pathname: string
): UseMutationResult<
  PostMutation,
  Error,
  number | undefined,
  PostContext | PostsContext
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | undefined): Promise<PostMutation> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: HttpMethod.DELETE,
      });

      const result: PostMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      id: number | undefined
    ): Promise<PostContext | PostsContext | undefined> => {
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
                    posts: page.data?.posts.filter(
                      (
                        post: PostWithRelationsAndRelationCountsAndUserReaction
                      ) => {
                        return post?.id !== id;
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

        queryClient.removeQueries({ queryKey });

        return { previousPost };
      }
    },
    onError: (
      _error,
      _id,
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
