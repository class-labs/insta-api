import { toFullyQualifiedUrl } from '../../support/image';
import type { Post } from '../../types/Post';
import type { User } from '../../types/User';

// Ensure the password is not exposed
export function normalizeUser(user: User) {
  const { id, name, profilePhoto, username } = user;
  return { id, name, profilePhoto, username };
}

export function normalizePostListItem(
  post: Post,
  author: User,
  user: User | null,
) {
  const { id, photo, caption, likedBy, comments, createdAt } = post;
  return {
    id,
    author: normalizeUser(author),
    photo: toFullyQualifiedUrl(photo),
    caption,
    likeCount: likedBy.length,
    commentCount: comments.length,
    isLikedByViewer: user ? likedBy.includes(user.id) : false,
    createdAt,
  };
}

export function normalizePost(post: Post) {
  const { id, author, photo, ...other } = post;
  return {
    id,
    author,
    photo: toFullyQualifiedUrl(photo),
    ...other,
  };
}
