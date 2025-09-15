'use client';

import clsx from 'clsx';
import { type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreatePost, useSignedInUser } from '@/lib/hooks';
import { postSchema } from '@/lib/schemas';
import type { PostSchema } from '@/lib/types';

import { Button } from '../Button/Button';

type Props = { className?: string };

export const PostForm = ({ className = '' }: Props): ReactNode => {
  const { signedInUser } = useSignedInUser();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      body: '',
      userId: signedInUser?.id,
      clerkUserId: signedInUser?.clerkId,
      originalPostId: null,
      hasSharedPost: false,
    },
  });

  const queryKey = { userId: undefined, clerkUserId: null, query: null };
  const { mutate: createPost } = useCreatePost(queryKey);

  // TODO: Refactor
  useEffect((): void => {
    if (signedInUser?.id) {
      reset({
        title: '',
        body: '',
        userId: signedInUser.id,
        clerkUserId: signedInUser.clerkId,
        originalPostId: null,
        hasSharedPost: false,
      });
    }
  }, [signedInUser, reset]);

  const onSubmit = (data: PostSchema): void => {
    createPost(data, {
      onSuccess: (): void => {
        reset();
        toast.success('Post created successfully!');
      },
      onError: (error: Error): void => {
        toast.error(Object.values(error).flat().join('. ').trim());
      },
    });
  };

  const classNames = clsx(
    'min-w-[344px] w-full flex flex-col gap-4',
    'md:gap-6',
    'xl:gap-8',
    'bg-card',
    className
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames}
    >
      <label className='flex flex-col gap-2 text-sm font-bold text-input-foreground'>
        Title
        <input
          {...register('title')}
          name='title'
          placeholder='Enter title'
          className='bg-input shadow rounded py-2 px-3 text-input-foreground leading-tight focus:outline-none focus:shadow-outline'
        />
        {errors.title && (
          <p className='text-red-700'>{`${errors.title.message}`}</p>
        )}
      </label>
      <label className='flex flex-col gap-2 text-sm font-bold text-input-foreground'>
        Body
        <textarea
          {...register('body')}
          name='body'
          rows={4}
          placeholder='Enter body'
          className='bg-input shadow rounded py-2 px-3 text-input-foreground leading-tight focus:outline-none focus:shadow-outline resize-none'
        />
        {errors.body && (
          <p className='text-red-700'>{`${errors.body.message}`}</p>
        )}
      </label>
      <Button disabled={isSubmitting}>Create post</Button>
    </form>
  );
};
