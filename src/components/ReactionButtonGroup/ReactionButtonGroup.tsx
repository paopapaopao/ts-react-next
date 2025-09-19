'use client';

import { usePathname } from 'next/navigation';
import {
  type Attributes,
  type ReactNode,
  Children,
  cloneElement,
  isValidElement,
  useEffect,
} from 'react';
import { useForm } from 'react-hook-form';
import { GrDislike, GrLike } from 'react-icons/gr';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Post, type User, ReactionType } from '@prisma/client';

import {
  useCreateReaction,
  useDeleteReaction,
  usePostQueryKey,
  useSignedInUser,
  useUpdateReaction,
} from '@/lib/hooks';
import { reactionSchema } from '@/lib/schemas';
import type {
  CommentWithRelationsAndRelationCountsAndUserReaction,
  PostWithRelationsAndRelationCountsAndUserReaction,
  ReactionSchema,
} from '@/lib/types';
import { getCommentQueryKey } from '@/lib/utilities';

type Props = {
  children: ReactNode;
  classNames?: string;
  comment?: CommentWithRelationsAndRelationCountsAndUserReaction;
  commentId?: number | null;
  post?:
    | PostWithRelationsAndRelationCountsAndUserReaction
    | (Post & { user: User })
    | null;
  postId?: number | null;
};

export const ReactionButtonGroup = ({
  children,
  classNames = '',
  comment = null,
  commentId = null,
  post = null,
  postId = null,
}: Props): ReactNode => {
  const { signedInUser } = useSignedInUser();

  const { handleSubmit, setValue, getValues, reset } = useForm<ReactionSchema>({
    resolver: zodResolver(reactionSchema),
    defaultValues: {
      type: ReactionType.LIKE,
      userId: signedInUser?.id,
      clerkUserId: signedInUser?.clerkId,
      postId,
      commentId,
    },
  });

  const pathname = usePathname();
  const postQueryKey = usePostQueryKey();

  const commentQueryKey = getCommentQueryKey(
    comment?.postId,
    comment?.parentCommentId
  );

  const { mutate: createReaction } = useCreateReaction({
    postQueryKey,
    pathname,
    commentQueryKey,
  });

  const { mutate: updateReaction } = useUpdateReaction({
    postQueryKey,
    pathname,
    commentQueryKey,
  });

  const { mutate: deleteReaction } = useDeleteReaction({
    parentCommentId: comment?.parentCommentId,
    postQueryKey,
    pathname,
    commentQueryKey,
  });

  // TODO: Refactor
  useEffect((): void => {
    if (signedInUser?.id) {
      reset({
        type: ReactionType.LIKE,
        userId: signedInUser?.id,
        clerkUserId: signedInUser?.clerkId,
        postId,
        commentId,
      });
    }
  }, [signedInUser, postId, commentId, reset]);

  const options = {
    onSuccess: (): void => {
      // TODO
      toast.success(
        <div className='flex items-center gap-2'>
          Reacted
          {getValues('type') === ReactionType.LIKE ? (
            <GrLike size={16} />
          ) : (
            <GrDislike size={16} />
          )}
        </div>
      );
    },
    onError: (error: Error): void => {
      toast.error(Object.values(error).flat().join('. ').trim());
    },
  };

  const onSubmit = (data: ReactionSchema): void => {
    if (post !== null && comment === null) {
      if ('userReaction' in post && post.userReaction === null) {
        createReaction(data, options);
      }

      if (
        'userReaction' in post &&
        post.userReaction !== null &&
        post?.userReaction?.type !== data.type
      ) {
        updateReaction({ id: post?.userReaction?.id, payload: data }, options);
      }

      if (
        'userReaction' in post &&
        post.userReaction !== null &&
        post?.userReaction?.type === data.type
      ) {
        deleteReaction(post.userReaction.id, options);
      }
    }

    if (post === null && comment !== null) {
      if ('userReaction' in comment && comment.userReaction === null) {
        createReaction(data, options);
      }

      if (
        'userReaction' in comment &&
        comment.userReaction !== null &&
        comment?.userReaction?.type !== data.type
      ) {
        updateReaction(
          { id: comment?.userReaction?.id, payload: data },
          options
        );
      }

      if (
        'userReaction' in comment &&
        comment.userReaction !== null &&
        comment?.userReaction?.type === data.type
      ) {
        deleteReaction(comment.userReaction.id, options);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames}
    >
      {Children.map(children, (child, index) =>
        !isValidElement(child)
          ? null
          : cloneElement(child, {
              onClick: () => {
                setValue(
                  'type',
                  index === 0 ? ReactionType.LIKE : ReactionType.DISLIKE
                );
              },
            } as Attributes)
      )}
    </form>
  );
};
