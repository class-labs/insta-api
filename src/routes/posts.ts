import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { db } from '../db';
import { schema } from '../support/schema';
import { validateImageFileName } from '../support/image';

import { normalizePost, normalizePostListItem } from './helpers/normalize';

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
    return posts.map((post) => normalizePostListItem(post, user));
  }),

  app.get('/posts/:id', async (request) => {
    const { id } = request.params;
    const post = await db.Post.getById(id);
    if (!post) {
      return;
    }
    return normalizePost(post);
  }),

  app.post('/posts', async (request) => {
    const user = await request.authenticate();
    const body = await request.json();
    if (!PostCreateInput.guard(body)) {
      throw new HttpError({ status: 400 });
    }
    const { photo, caption } = body;
    if (!validateImageFileName(photo)) {
      throw new HttpError({ status: 400, message: 'Invalid photo' });
    }
    const post = await db.Post.insert({
      author: user.id,
      photo,
      caption,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    });
    return normalizePost(post);
  }),

  app.delete('/posts/:id', async (request) => {
    const user = await request.authenticate();
    const postId = request.params.id;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError({ status: 400, message: 'Invalid postId' });
    }
    // TODO: Allow admin
    if (post.author !== user.id) {
      throw new HttpError({ status: 403, message: 'Forbidden' });
    }
    await db.Post.delete(post.id);
    return { success: true };
  }),

  app.post('/posts/:id/like', async (request) => {
    const user = await request.authenticate();
    const postId = request.params.id;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError({ status: 400, message: 'Invalid postId' });
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
    return normalizePost(newPost ?? post);
  }),
]);
