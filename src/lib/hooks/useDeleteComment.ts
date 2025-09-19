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
  CommentsContext,
  CommentWithRelationsAndRelationCountsAndUserReaction,
} from '../types';
import { getCommentQueryKey } from '../utilities';

type Params = {
  postId?: number;
  parentCommentId?: number | null;
};

export const useDeleteComment = ({
  postId,
  parentCommentId,
}: Params): UseMutationResult<
  CommentMutation,
  Error,
  number | undefined,
  CommentsContext
> => {
  const queryClient = useQueryClient();
  const queryKey = getCommentQueryKey(postId, parentCommentId);

  return useMutation({
    mutationFn: async (id: number | undefined): Promise<CommentMutation> => {
      const response = await fetch(`/api/comments/${id}`, {
        method: HttpRequestMethod.DELETE,
      });

      const result: CommentMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onMutate: async (
      id: number | undefined
    ): Promise<CommentsContext | undefined> => {
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
                  comments: page.data?.comments.filter(
                    (
                      comment: CommentWithRelationsAndRelationCountsAndUserReaction
                    ) => {
                      return comment?.id !== id;
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
    onError: (_error, _id, context: CommentsContext | undefined): void => {
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(queryKey, context.previousComments);
      }
    },
    onSettled: (): void => {
      queryClient.invalidateQueries({ queryKey: [QueryKey.COMMENTS, postId] });

      if (parentCommentId === null) {
        queryClient.invalidateQueries({ queryKey: [QueryKey.POSTS] });
      }
    },
  });
};
