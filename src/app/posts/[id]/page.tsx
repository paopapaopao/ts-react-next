'use client';

import clsx from 'clsx';
import { type JSX, use, useEffect } from 'react';

import { PostCard, PostCardSkeleton } from '@/components';
import { useCreateView, useReadPost, useSignedInUser } from '@/lib/hooks';

type Props = {
  params: Promise<{ id: string }>;
};

const Page = ({ params }: Props): JSX.Element => {
  const { id } = use(params);
  const { data, error, isLoading } = useReadPost(id);

  const { signedInUser } = useSignedInUser();
  const { mutate: createView } = useCreateView();

  useEffect((): void => {
    if (signedInUser && signedInUser.id && id) {
      createView({
        userId: signedInUser.id,
        postId: Number(id),
      });
    }
  }, [signedInUser, id, createView]);

  const classNames = clsx('p-2 flex flex-col items-center', 'md:p-5', 'xl:p-8');

  return (
    <main className={classNames}>
      {isLoading ? (
        <PostCardSkeleton className='min-w-[344px] w-full max-w-screen-xl' />
      ) : data === undefined ? (
        <p>{error?.message}</p>
      ) : (
        <PostCard
          post={data?.data?.post ?? null}
          className='min-w-[344px] w-full max-w-screen-xl'
        />
      )}
    </main>
  );
};

export default Page;
