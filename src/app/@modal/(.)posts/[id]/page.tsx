'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { type JSX, use, useEffect, useRef } from 'react';

import { Popover, PostCard, PostCardSkeleton } from '@/components';
import { useReadPost } from '@/lib/hooks';

type Props = {
  params: Promise<{ id: string }>;
};

const Page = ({ params }: Props): JSX.Element => {
  const { id } = use(params);
  const { data, error, isLoading } = useReadPost(id);

  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect((): void => {
    if (ref.current !== null) {
      ref.current.showModal();
    }
  }, [ref]);

  const { back } = useRouter();

  const classNames = clsx('flex flex-col gap-2', 'md:gap-3', 'xl:gap-4');

  return (
    <Popover
      innerRef={ref}
      onEscapeKeyDown={back}
      onOutsideClick={back}
    >
      <Popover.Title
        onCloseClick={back}
        className='px-2 pt-2 md:px-3 md:pt-3 xl:px-4 xl:pt-4'
      />
      <Popover.Content className={classNames}>
        {isLoading ? (
          <PostCardSkeleton />
        ) : data === undefined ? (
          <p>{error?.message}</p>
        ) : (
          <PostCard post={data?.data?.post ?? null} />
        )}
      </Popover.Content>
    </Popover>
  );
};

export default Page;
