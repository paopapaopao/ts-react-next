'use client';

import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { QueryKey } from '../enumerations';
import type { PageParam, PostInfiniteQuery } from '../types';

type Params = {
  userId?: string;
  clerkUserId?: string | null;
  query?: string | null;
};

export const useReadPosts = ({
  userId,
  clerkUserId,
  query,
}: Params): UseInfiniteQueryResult<
  InfiniteData<PostInfiniteQuery, number | null>,
  Error
> => {
  return useInfiniteQuery({
    queryKey: [QueryKey.POSTS, { userId, clerkUserId, query }],
    queryFn: async ({ pageParam }: PageParam): Promise<PostInfiniteQuery> => {
      const params = new URLSearchParams();

      if (userId !== undefined) {
        params.append('userId', userId);
      }

      if (clerkUserId !== undefined && clerkUserId !== null) {
        params.append('clerkUserId', clerkUserId);
      }

      if (query !== undefined && query !== null && query.trim() !== '') {
        params.append('query', query.trim());
      }

      params.append('cursor', String(pageParam));

      const response = await fetch(`/api/posts?${params.toString()}`);
      const result: PostInfiniteQuery = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage: PostInfiniteQuery): number | null => {
      return lastPage.data?.nextCursor ?? null;
    },
  });
};
