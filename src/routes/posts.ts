import { defineRoutes } from '../server';
import { db } from '../db';

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
]);
