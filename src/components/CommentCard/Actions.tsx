'use client';

import { type ReactNode } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';

import { useDeleteComment, usePostQueryKey } from '@/lib/hooks';

import { Button } from '../Button/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui';

import { useCommentCard } from './useCommentCard';

export const Actions = (): ReactNode => {
  const { comment, type, hasReplies, onModeToggle } = useCommentCard();

  const postQueryKey = usePostQueryKey();

  const { mutate: deleteComment } = useDeleteComment(
    comment?.postId,
    comment?.parentCommentId,
    postQueryKey
  );

  const handleClick = (): void => {
    deleteComment(comment?.id, {
      onSuccess: (): void => {
        toast.success(`${type} deleted successfully!`);
      },
      onError: (error: Error): void => {
        toast.error(Object.values(error).flat().join('. ').trim());
      },
    });
  };

  return (
    <div className='flex gap-4'>
      <button onClick={onModeToggle}>
        <FaRegEdit
          size={16}
          className='text-comment-card-foreground'
        />
      </button>
      <Popover>
        <PopoverTrigger>
          <RiDeleteBin6Line
            size={16}
            className='text-comment-card-foreground'
          />
        </PopoverTrigger>
        <PopoverContent className='gap-2'>
          <h2 className='text-lg font-bold'>Delete {type.toLowerCase()}</h2>
          <p className='text-center'>
            {hasReplies && (
              <>
                All {comment?._count.replies} replies will be deleted as well.
                <br />
              </>
            )}
            Are you sure you want to delete this {type.toLowerCase()}?
          </p>
          <Button onClick={handleClick}>Delete</Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
