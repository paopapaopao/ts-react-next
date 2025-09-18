'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCreateComment,
  usePostQueryKey,
  useSignedInUser,
} from '@/lib/hooks';
import { commentSchema } from '@/lib/schemas';
import type { CommentSchema } from '@/lib/types';

import { usePostCard } from '../PostCard/usePostCard';

type Props = { parentCommentId?: number | null };

export const CommentForm = ({ parentCommentId = null }: Props): ReactNode => {
  const { signedInUser } = useSignedInUser();
  const { post } = usePostCard();

  const {
    formState: { isSubmitting },
    register,
    handleSubmit,
    reset,
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: '',
      userId: signedInUser?.id,
      clerkUserId: signedInUser?.clerkId,
      postId: post?.id,
      parentCommentId,
    },
  });

  const postQueryKey = usePostQueryKey();
  const { mutate: createComment } = useCreateComment(postQueryKey);

  const onSubmit = (data: CommentSchema): void => {
    createComment(data, {
      onSuccess: (): void => {
        reset();
        toast.success(
          `${
            parentCommentId === null ? 'Comment' : 'Reply'
          } created successfully!`
        );
      },
      onError: (error: Error): void => {
        toast.error(Object.values(error).flat().join('. ').trim());
      },
    });
  };

  const classNames = clsx(
    'p-2 flex-auto flex gap-4',
    'md:gap-6',
    'xl:gap-8',
    'rounded-lg bg-comment-input'
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames}
    >
      <input
        {...register('body')}
        name='body'
        className='flex-auto outline-none rounded-lg bg-comment-input text-comment-input-foreground'
      />
      <button disabled={isSubmitting}>
        <BiSend
          size={24}
          className='text-comment-input-foreground'
        />
      </button>
    </form>
  );
};
