'use client';

import {
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { HttpRequestMethod, QueryKey } from '../enumerations';
import type { ViewMutation, ViewSchema } from '../types';

export const useCreateView = (): UseMutationResult<
  ViewMutation,
  Error,
  ViewSchema
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ViewSchema): Promise<ViewMutation> => {
      const response = await fetch('/api/views', {
        method: HttpRequestMethod.POST,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result: ViewMutation = await response.json();

      if (!response.ok && result.errors !== null) {
        throw new Error(Object.values(result.errors).flat().join('. ').trim());
      }

      return result;
    },
    onSettled: (_data, _error, { postId }: ViewSchema): void => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.POSTS, postId],
        exact: true,
      });
    },
  });
};
