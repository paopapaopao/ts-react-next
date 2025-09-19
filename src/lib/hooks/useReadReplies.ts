'use client';

import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { QueryKey } from '../enumerations';
import type { CommentInfiniteQuery, PageParam } from '../types';

export const useReadReplies = (
  postId?: number,
  commentId?: number
): UseInfiniteQueryResult<
  InfiniteData<CommentInfiniteQuery, number | null>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: [QueryKey.COMMENTS, postId, commentId],
    queryFn: async ({
      pageParam,
    }: PageParam): Promise<CommentInfiniteQuery> => {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}/replies?cursor=${pageParam}`
      );

      const result: CommentInfiniteQuery = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage: CommentInfiniteQuery): number | null => {
      return lastPage.data?.nextCursor ?? null;
    },
  });
};
