import { QueryKey } from '../enumerations';

export const getCommentQueryKey = (
  postId: number | undefined,
  parentCommentId: number | null | undefined
): (QueryKey | number | undefined)[] => {
  const queryKey = [QueryKey.COMMENTS, postId];

  return parentCommentId === null ? queryKey : [...queryKey, parentCommentId];
};
