'use client';

import {
  type InfiniteData,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { HttpRequestMethod, QueryKey } from '../enumerations';
import type {
  PaoPostContext,
  PostInfiniteQuery,
  PostMutation,
  PostQuery,
  PostQueryKeyParams,
  PostVariables,
  PostWithRelationsAndRelationCountsAndUserReaction,
} from '../types';

export const useUpdatePost = (
  queryKey: PostQueryKeyParams
): UseMutationResult<PostMutation, Error, PostVariables, PaoPostContext> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: PostVariables): Promise<PostMutation> => {
      const response = await fetch(`/api/posts/${id}`, {
        method: HttpRequestMethod.PUT,
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
    }: PostVariables): Promise<PaoPostContext | undefined> => {
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
      } else {
        queryClient.setQueryData(
          [QueryKey.POSTS, queryKey],
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
      }

      return { previousData };
    },
    onError: (
      _error,
      _variables,
      context: PaoPostContext | undefined
    ): void => {
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
