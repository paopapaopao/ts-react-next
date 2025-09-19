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
  CommentMutation,
  CommentSchema,
  CommentsContext,
} from '../types';
import { getCommentQueryKey } from '../utilities';

import { useSignedInUser } from './useSignedInUser';

export const useCreateComment = (): UseMutationResult<
  CommentMutation,
  Error,
  CommentSchema,
  CommentsContext
> => {
  const queryClient = useQueryClient();
  const { signedInUser } = useSignedInUser();

  return useMutation({
    mutationFn: async (payload: CommentSchema): Promise<CommentMutation> => {
      const response = await fetch('/api/comments', {
        method: HttpRequestMethod.POST,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: CommentMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      payload: CommentSchema
    ): Promise<CommentsContext | undefined> => {
      const { postId, parentCommentId } = payload;
      const queryKey = getCommentQueryKey(postId, parentCommentId);

      await queryClient.cancelQueries({ queryKey });

      const previousComments =
        queryClient.getQueryData<
          InfiniteData<CommentInfiniteQuery, number | null>
        >(queryKey);

      queryClient.setQueryData(
        queryKey,
        // TODO
        (
          oldComments:
            | InfiniteData<CommentInfiniteQuery, number | null>
            | undefined
        ) => {
          const id = Number(new Date());

          const mockCommentData = {
            id,
            body: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 0,
            postId: 0,
            parentCommentId: null,
            user: signedInUser,
            _count: {
              replies: 0,
              reactions: 0,
            },
            userReaction: null,
          };

          const newPage = {
            data: {
              comments: [{ ...mockCommentData, ...payload }],
              nextCursor: id,
            },
            errors: null,
          };

          return oldComments === undefined
            ? {
                pages: [newPage],
                // pageParams: [id],
              }
            : {
                ...oldComments,
                pages: [...oldComments.pages, newPage],
                // pageParams: [...oldComments.pageParams, id],
              };
        }
      );

      return { previousComments };
    },
    onError: (
      _error,
      { postId, parentCommentId }: CommentSchema,
      context: CommentsContext | undefined
    ): void => {
      if (context?.previousComments !== undefined) {
        const queryKey = getCommentQueryKey(postId, parentCommentId);

        queryClient.setQueryData(queryKey, context.previousComments);
      }
    },
    onSettled: (
      _data,
      _error,
      { postId, parentCommentId }: CommentSchema
    ): void => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.COMMENTS, postId] });

      if (parentCommentId === null) {
        queryClient.invalidateQueries({ queryKey: [QueryKey.POSTS] });
      }
    },
  });
};
