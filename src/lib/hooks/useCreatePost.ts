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
  PostSchema,
  PostsContext,
} from '../types';

import { useSignedInUser } from './useSignedInUser';

type Params = {
  userId: undefined;
  clerkUserId: null;
  query: null;
};

export const useCreatePost = (
  queryKey: Params
): UseMutationResult<PostMutation, Error, PostSchema, PostsContext> => {
  const queryClient = useQueryClient();
  const { signedInUser } = useSignedInUser();

  return useMutation({
    mutationFn: async (payload: PostSchema): Promise<PostMutation> => {
      const response = await fetch('/api/posts', {
        method: HttpRequestMethod.POST,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: PostMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      payload: PostSchema
    ): Promise<PostsContext | undefined> => {
      await queryClient.cancelQueries({ queryKey: [QueryKey.POSTS, queryKey] });

      const previousPosts = queryClient.getQueryData<
        InfiniteData<PostInfiniteQuery, number | null>
      >([QueryKey.POSTS, queryKey]);

      queryClient.setQueryData(
        [QueryKey.POSTS, queryKey],
        // TODO
        (
          oldPosts: InfiniteData<PostInfiniteQuery, number | null> | undefined
        ) => {
          const id = Number(new Date());

          const mockPostData = {
            id,
            title: '',
            body: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 0,
            originalPostId: null,
            hasSharedPost: false,
            user: signedInUser,
            originalPost: null,
            _count: {
              shares: 0,
              comments: 0,
              reactions: 0,
              views: 0,
            },
            userReaction: null,
          };

          const newPage = {
            data: {
              posts: [{ ...mockPostData, ...payload }],
              nextCursor: id,
            },
            errors: null,
          };

          return oldPosts === undefined
            ? {
                pages: [newPage],
                // pageParams: [id],
              }
            : {
                ...oldPosts,
                pages: [newPage, ...oldPosts.pages],
                // pageParams: [id, ...oldPosts.pageParams],
              };
        }
      );

      return { previousPosts };
    },
    onError: (_error, _payload, context: PostsContext | undefined): void => {
      if (context?.previousPosts !== undefined) {
        queryClient.setQueryData(
          [QueryKey.POSTS, queryKey],
          context.previousPosts
        );
      }
    },
    onSettled: (): void => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.POSTS] });
    },
  });
};
