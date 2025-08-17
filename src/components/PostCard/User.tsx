'use client';

import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode } from 'react';

import defaultProfilePhoto from '@/assets/images/default-profile-photo.jpg';
import { getName } from '@/lib/utilities';

import { usePostCard } from './usePostCard';

export const User = (): ReactNode => {
  const { post } = usePostCard();

  const classNames = clsx('flex items-start gap-2', 'md:gap-3', 'xl:gap-4');

  return (
    <div className={classNames}>
      <Image
        src={post?.user?.image || defaultProfilePhoto}
        alt='Profile photo'
        width={48}
        height={48}
        className='rounded-full'
      />
      <Link
        href={`/users/${post?.user.id}`}
        className='font-bold text-card-foreground hover:text-green-600'
      >
        {getName(post?.user)}
      </Link>
    </div>
  );
};
