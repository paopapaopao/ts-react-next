'use client';

import { type UseQueryResult, useQuery } from '@tanstack/react-query';

import { QueryKey } from '../enumerations';
import type { PostQuery } from '../types';

export const useReadPost = (id: string): UseQueryResult<PostQuery, Error> => {
  return useQuery({
    queryKey: [QueryKey.POSTS, id],
    queryFn: async (): Promise<PostQuery> => {
      const response = await fetch(`/api/posts/${id}`);
      const result: PostQuery = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
  });
};
