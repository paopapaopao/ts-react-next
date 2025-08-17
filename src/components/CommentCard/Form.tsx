'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { BiSend } from 'react-icons/bi';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUpdateComment } from '@/lib/hooks';
import { commentSchema } from '@/lib/schemas';
import type { CommentSchema } from '@/lib/types';

import { useCommentCard } from './useCommentCard';

export const Form = (): ReactNode => {
  const { comment, onSuccess } = useCommentCard();

  const {
    formState: { isSubmitting },
    register,
    handleSubmit,
    reset,
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      body: comment?.body,
      userId: comment?.userId,
      clerkUserId: comment?.clerkUserId,
      postId: comment?.postId,
      parentCommentId: comment?.parentCommentId,
    },
  });

  const { mutate: updateComment } = useUpdateComment();

  const onSubmit = (data: CommentSchema): void => {
    updateComment(
      { id: comment?.id, payload: data },
      {
        onSuccess: (): void => {
          reset();
          onSuccess();
          toast.success(
            `${
              comment?.parentCommentId === null ? 'Comment' : 'Reply'
            } updated successfully!`
          );
        },
        onError: (error: Error): void => {
          toast.error(Object.values(error).flat().join('. ').trim());
        },
      }
    );
  };

  const classNames = clsx('flex gap-4', 'md:gap-5', 'xl:gap-6');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames}
    >
      <input
        {...register('body')}
        name='body'
        className='flex-auto outline-none rounded-lg bg-comment-card text-comment-card-foreground'
      />
      <button disabled={isSubmitting}>
        <BiSend size={24} />
      </button>
    </form>
  );
};
