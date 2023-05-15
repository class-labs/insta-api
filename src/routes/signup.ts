import { HttpError } from '@nbit/express';

import { db } from '../db';
import { defineRoutes } from '../server';
import { schema } from '../support/schema';

const UserCreateInput = schema(({ Record, String }) => {
  return Record({
    name: String,
    profilePhoto: String.optional(),
    username: String,
    password: String,
  });
});

export default defineRoutes((app) => [
  app.post('/signup', async (request) => {
    const body = await request.json();
    if (!UserCreateInput.guard(body)) {
      throw new HttpError({ status: 400 });
    }
    const { name, profilePhoto, username, password } = body;
    if (!username.length || username.match(/\W/)) {
      throw new HttpError({ status: 400, message: 'Invalid username' });
    }
    const existingUsers = await db.User.findWhere(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
    if (existingUsers.length) {
      throw new HttpError({ status: 400, message: 'Username already exists' });
    }
    const user = await db.User.insert({
      name,
      profilePhoto: profilePhoto ?? '',
      username,
      password,
    });
    const now = new Date().toISOString();
    const session = await db.Session.insert({ user: user.id, createdAt: now });
    return {
      success: true,
      user: {
        id: user.id,
        name,
        username,
      },
      token: session.id,
    };
  }),
]);
