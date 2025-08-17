'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';

import { ApiReadResourceCount } from '@/lib/enumerations';
import { useReadComments } from '@/lib/hooks';
import type { CommentWithRelationsAndRelationCountsAndUserReaction } from '@/lib/types';

import { CommentCard } from '../CommentCard/CommentCard';
import { CommentCardSkeleton } from '../CommentCardSkeleton/CommentCardSkeleton';
import { usePostCard } from '../PostCard/usePostCard';

export const CommentList = (): ReactNode => {
  const { post } = usePostCard();

  const {
    data,
    error,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useReadComments(post?.id);

  const handleClick = (): void => {
    fetchNextPage();
  };

  const classNames = clsx('flex flex-col gap-2', 'md:gap-3', 'xl:gap-4');

  return isPending ? (
    <ul className={classNames}>
      {Array.from({ length: ApiReadResourceCount.COMMENTS }).map(
        (_, index: number) => (
          <li key={`comment-skeleton-${index}`}>
            <CommentCardSkeleton />
          </li>
        )
      )}
    </ul>
  ) : isError ? (
    <p className='text-red-600'>
      {Object.values(error).flat().join('. ').trim()}
    </p>
  ) : (
    <div className={classNames}>
      <ul className={classNames}>
        {data?.pages
          .flatMap((page) => page.data?.comments ?? [])
          ?.map(
            (comment: CommentWithRelationsAndRelationCountsAndUserReaction) => (
              <li key={`comment-${comment?.id}`}>
                <CommentCard comment={comment} />
              </li>
            )
          )}
      </ul>
      {isFetchingNextPage && <CommentCardSkeleton />}
      {hasNextPage ? (
        <p
          onClick={handleClick}
          className='cursor-pointer text-card-foreground'
        >
          View more comments
        </p>
      ) : (
        <p className='cursor-pointer text-card-foreground'>
          All comments loaded.
        </p>
      )}
    </div>
  );
};
