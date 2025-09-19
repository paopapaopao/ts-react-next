'use client';

import { useParams, usePathname, useSearchParams } from 'next/navigation';

import type { PostQueryKeyParams } from '../types';

import { useSignedInUser } from './useSignedInUser';

export const usePostQueryKey = (): PostQueryKeyParams => {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const { signedInUser } = useSignedInUser();
  const postId = pathname.startsWith('/posts') ? params.id : undefined;
  const userId = pathname.startsWith('/users') ? params.id : undefined;
  const clerkUserId = pathname === '/profile' ? signedInUser?.clerkId : null;
  const query = searchParams.get('query');

  return postId ?? { userId, clerkUserId, query };
};
