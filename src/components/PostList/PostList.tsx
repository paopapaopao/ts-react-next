'use client';

import clsx from 'clsx';
import { type ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ApiReadResourceCount } from '@/lib/enumerations';
import { useReadPosts } from '@/lib/hooks';
import type { PostWithRelationsAndRelationCountsAndUserReaction } from '@/lib/types';

import { PostCard } from '../PostCard/PostCard';
import { PostCardSkeleton } from '../PostCardSkeleton/PostCardSkeleton';

type Props = {
  userId?: string;
  clerkUserId?: string | null;
  query?: string | null;
};

export const PostList = ({ userId, clerkUserId, query }: Props): ReactNode => {
  const {
    data,
    error,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useReadPosts({ userId, clerkUserId, query });

  const { inView, ref } = useInView();

  useEffect((): void => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const classNames = clsx(
    'flex flex-col items-center gap-2',
    'md:gap-3',
    'xl:gap-4'
  );

  return isPending ? (
    <ul className={clsx('self-stretch', classNames)}>
      {Array.from({ length: ApiReadResourceCount.POSTS }).map(
        (_, index: number) => (
          <li
            key={`post-skeleton-${index}`}
            className='self-stretch'
          >
            <PostCardSkeleton className='mx-auto min-w-[344px] max-w-screen-xl' />
          </li>
        )
      )}
    </ul>
  ) : isError ? (
    <p className='text-red-600'>{error.message}</p>
  ) : (
    <>
      <ul className={classNames}>
        {data.pages
          .flatMap((page) => page.data?.posts ?? [])
          ?.map((post: PostWithRelationsAndRelationCountsAndUserReaction) => (
            <li
              key={`post-${post?.id}`}
              className='self-stretch'
            >
              <PostCard
                post={post}
                className='min-w-[344px] max-w-screen-xl'
              />
            </li>
          ))}
      </ul>
      {hasNextPage ? (
        <div
          ref={ref}
          className='self-stretch'
        >
          {isFetchingNextPage && (
            <PostCardSkeleton className='mx-auto min-w-[344px] max-w-screen-xl' />
          )}
        </div>
      ) : (
        <p>All posts loaded.</p>
      )}
    </>
  );
};
