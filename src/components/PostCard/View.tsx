'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

import { usePostCard } from './usePostCard';

export const View = (): ReactNode => {
  const { post } = usePostCard();

  const pathname = usePathname();

  const classNames = clsx(
    'flex flex-col items-start gap-2',
    'md:gap-3',
    'xl:gap-4'
  );

  return (
    <div className={classNames}>
      {pathname === '/' || pathname === '/search' ? (
        <Link href={`/posts/${post?.id}`}>
          <h4 className='text-lg font-bold hover:text-green-600'>
            {post?.title}
          </h4>
        </Link>
      ) : (
        <h4 className='text-lg font-bold'>{post?.title}</h4>
      )}
      <p className='indent-4'>{post?.body}</p>
    </div>
  );
};
