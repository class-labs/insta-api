import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { db } from '../db';
import { schema } from '../support/schema';
import { validateImageFileName } from '../support/image';

import {
  normalizePost,
  normalizePostFull,
  normalizePostListItem,
} from './helpers/normalize';

const PostCreateInput = schema(({ Record, String }) => {
  return Record({
    photo: String,
    caption: String,
  });
});

export default defineRoutes((app) => [
  app.get('/posts', async (request) => {
    const user = await request.getCurrentUser();
    const posts = await db.Post.getAll();
    posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const users = await db.User.getAll();
    const usersMap = new Map(users.map((user) => [user.id, user]));
    return posts.flatMap((post) => {
      const author = usersMap.get(post.author);
      return author ? [normalizePostListItem(post, author, user)] : [];
    });
  }),

  app.get('/posts/:id', async (request) => {
    const { id } = request.params;
    const user = await request.getCurrentUser();
    const post = await db.Post.getById(id);
    const users = await db.User.getAll();
    const usersMap = new Map(users.map((user) => [user.id, user]));
    const comments = await db.Comment.getAll();
    const commentsMap = new Map(
      comments.map((comment) => [comment.id, comment]),
    );
    const author = await db.User.getById(post?.author ?? '');
    if (!post || !author) {
      return;
    }
    return normalizePostFull(post, author, usersMap, commentsMap, user);
  }),

  app.post('/posts', async (request) => {
    const user = await request.authenticate();
    const body = await request.json();
    if (!PostCreateInput.guard(body)) {
      throw new HttpError(400);
    }
    const { caption } = body;
    const photo = body.photo.split('/').pop() ?? '';
    if (!validateImageFileName(photo)) {
      throw new HttpError(400, 'Invalid photo');
    }
    const post = await db.Post.insert({
      author: user.id,
      photo,
      caption,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
    return normalizePost(post, user, user);
  }),

  app.delete('/posts/:id', async (request) => {
    const user = await request.authenticate();
    const postId = request.params.id;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError(400, 'Invalid postId');
    }
    // TODO: Allow admin
    if (post.author !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }
    await db.Post.delete(post.id);
    return { success: true };
  }),

  app.post('/posts/:id/like', async (request) => {
    const user = await request.authenticate();
    const postId = request.params.id;
    const post = await db.Post.getById(postId);
    const author = await db.User.getById(post?.author ?? '');
    if (!post || !author) {
      throw new HttpError(400, 'Invalid postId');
    }
    const likedBy = new Set(post.likedBy);
    if (likedBy.has(user.id)) {
      likedBy.delete(user.id);
    } else {
      likedBy.add(user.id);
    }
    const newPost = await db.Post.update(postId, {
      likedBy: Array.from(likedBy),
    });
    return normalizePost(newPost ?? post, author, user);
  }),
]);
