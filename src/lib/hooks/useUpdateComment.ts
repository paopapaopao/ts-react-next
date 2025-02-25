'use client';

import {
  type InfiniteData,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  CommentInfiniteQuery,
  CommentMutation,
  CommentsContext,
  CommentVariables,
  CommentWithRelationsAndRelationCountsAndUserReaction,
} from '../types';
import { getCommentQueryKey } from '../utilities';

const useUpdateComment = (): UseMutationResult<
  CommentMutation,
  Error,
  CommentVariables,
  CommentsContext
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: CommentVariables): Promise<CommentMutation> => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: CommentMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async ({
      id,
      payload,
    }: CommentVariables): Promise<CommentsContext | undefined> => {
      const queryKey = getCommentQueryKey(
        payload.postId,
        payload.parentCommentId
      );

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
                      return comment?.id === id
                        ? { ...comment, ...payload }
                        : comment;
                    }
                  ),
                },
              };
            }),
          };
        }
      );

      return { previousComments };
    },
    onError: (
      _error,
      { payload }: CommentVariables,
      context: CommentsContext | undefined
    ): void => {
      if (context?.previousComments !== undefined) {
        const queryKey = getCommentQueryKey(
          payload.postId,
          payload.parentCommentId
        );

        queryClient.setQueryData(queryKey, context.previousComments);
      }
    },
    onSettled: (_data, _error, { payload }: CommentVariables): void => {
      const queryKey = getCommentQueryKey(
        payload.postId,
        payload.parentCommentId
      );

      queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
};

export default useUpdateComment;
