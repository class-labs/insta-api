import { HttpError, Response } from '@nbit/express';
import { Record, String } from 'runtypes';

import { db } from '../db';
import { defineRoutes } from '../server';

const Body = Record({
  username: String,
  password: String,
});

export default defineRoutes((app) => [
  app.post('/login', async (request) => {
    const body = await request.json();
    if (!Body.guard(body)) {
      throw new HttpError({ status: 400 });
    }
    const { username, password } = body;
    const users = await db.User.findWhere(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
    const user = users[0];
    if (!user || user.password !== password) {
      return Response.json({ success: false }, { status: 401 });
    }
    const now = new Date().toISOString();
    const session = await db.Session.insert({ user: user.id, createdAt: now });
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
      token: session.id,
    };
  }),

  app.post('/logout', async (request) => {
    const session = await request.getSession();
    if (session) {
      await db.Session.delete(session.id);
      return { success: true };
    } else {
      return { success: false };
    }
  }),

  app.get('/me', async (request) => {
    const user = await request.authenticate();
    if (!user) {
      throw new HttpError({ status: 401 });
    }
    const { id, name, username } = user;
    return { id, name, username };
  }),
]);
