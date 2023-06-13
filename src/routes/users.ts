import { defineRoutes } from '../server';
import { db } from '../db';

export default defineRoutes((app) => [
  app.get('/users', async () => {
    return await db.User.getAll();
  }),

  app.get('/users/:id', async (request) => {
    const { id } = request.params;
    const user = await db.User.getById(id);
    return user ?? undefined;
  }),
]);
