import { toFullyQualifiedUrl } from '../../support/image';
import type { Comment } from '../../types/Comment';
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
  viewer: User | null,
) {
  const { id, photo, caption, likedBy, comments, createdAt } = post;
  return {
    id,
    author: normalizeUser(author),
    photo: toFullyQualifiedUrl(photo),
    caption,
    likeCount: likedBy.length,
    commentCount: comments.length,
    isLikedByViewer: viewer ? likedBy.includes(viewer.id) : false,
    createdAt,
  };
}

export function normalizePost(post: Post, author: User, viewer: User | null) {
  const { id, photo, caption, likedBy, comments, createdAt } = post;
  return {
    id,
    author: normalizeUser(author),
    photo: toFullyQualifiedUrl(photo),
    caption,
    likedBy,
    comments,
    isLikedByViewer: viewer ? likedBy.includes(viewer.id) : false,
    createdAt,
  };
}

export function normalizePostFull(
  post: Post,
  author: User,
  allUsers: Map<string, User>,
  allComments: Map<string, Comment>,
  viewer: User | null,
) {
  const { id, photo, caption, likedBy, comments, createdAt } = post;
  return {
    id,
    author: normalizeUser(author),
    photo: toFullyQualifiedUrl(photo),
    caption,
    likedBy: likedBy.flatMap((id) => {
      const user = allUsers.get(id);
      return user ? [normalizeUser(user)] : [];
    }),
    comments: comments.flatMap((id) => {
      const comment = allComments.get(id);
      const user = comment ? allUsers.get(comment.author) : undefined;
      return comment && user ? [normalizeComment(comment, user)] : [];
    }),
    isLikedByViewer: viewer ? likedBy.includes(viewer.id) : false,
    createdAt,
  };
}

function normalizeComment(comment: Comment, author: User) {
  const { id, text, createdAt } = comment;
  return {
    id,
    author: normalizeUser(author),
    text,
    createdAt,
  };
}
