import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { db } from '../db';
import { schema } from '../support/schema';
import { validateImageFileName } from '../support/image';

const PostCreateInput = schema(({ Record, String }) => {
  return Record({
    photo: String,
    caption: String,
  });
});

export default defineRoutes((app) => [
  app.get('/posts', async () => {
    const posts = await db.Post.getAll();
    posts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return posts;
  }),

  app.get('/posts/:id', async (request) => {
    const { id } = request.params;
    return await db.Post.getById(id);
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
    return post;
  }),
]);
