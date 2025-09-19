import clsx from 'clsx';
import { type Metadata } from 'next';
import { type JSX } from 'react';

import { PostList } from '@/components';

export const metadata: Metadata = {
  title: 'User',
};

type Props = {
  params: { id: string };
};

const Page = ({ params }: Props): JSX.Element => {
  const { id } = params;

  const classNames = clsx(
    'p-2 flex flex-col items-center gap-4',
    'md:p-5 md:gap-6',
    'xl:p-8 xl:gap-8'
  );

  return (
    <main className={classNames}>
      <PostList userId={id} />
    </main>
  );
};

export default Page;
