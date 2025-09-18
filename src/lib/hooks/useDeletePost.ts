'use client';

import {
  type InfiniteData,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { HttpRequestMethod, QueryKey } from '../enumerations';
import type {
  PostInfiniteQuery,
  PostMutation,
  PostPostsContext,
  PostQuery,
  PostQueryKeyParams,
  PostWithRelationsAndRelationCountsAndUserReaction,
} from '../types';

export const useDeletePost = (
  queryKey: PostQueryKeyParams
): UseMutationResult<
  PostMutation,
  Error,
  number | undefined,
  PostPostsContext
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | undefined): Promise<PostMutation> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: HttpRequestMethod.DELETE,
      });

      const result: PostMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      id: number | undefined
    ): Promise<PostPostsContext | undefined> => {
      await queryClient.cancelQueries({ queryKey: [QueryKey.POSTS, queryKey] });

      const previousData = queryClient.getQueryData<
        InfiniteData<PostInfiniteQuery, number | null> | PostQuery
      >([QueryKey.POSTS, queryKey]);

      const isAListQuery = typeof queryKey === 'object';

      if (isAListQuery) {
        queryClient.setQueryData(
          [QueryKey.POSTS, queryKey],
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
      } else {
        queryClient.removeQueries({ queryKey: [QueryKey.POSTS, queryKey] });
      }

      return { previousData };
    },
    onError: (_error, _id, context: PostPostsContext | undefined): void => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          [QueryKey.POSTS, queryKey],
          context.previousData
        );
      }
    },
    onSettled: (): void => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.POSTS] });
    },
  });
};
