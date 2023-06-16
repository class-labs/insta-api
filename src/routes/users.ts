import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { db } from '../db';
import { schema } from '../support/schema';
import type { User } from '../types/User';

const UserCreateInput = schema(({ Record, String }) => {
  return Record({
    name: String,
    profilePhoto: String.optional(),
    username: String,
    password: String,
  });
});

export default defineRoutes((app) => [
  app.get('/users', async () => {
    const users = await db.User.getAll();
    return users.map((user) => normalizeUser(user));
  }),

  app.get('/users/:id', async (request) => {
    const { id } = request.params;
    const user = await db.User.getById(id);
    if (!user) {
      return;
    }
    return normalizeUser(user);
  }),

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
      user: normalizeUser(user),
      token: session.id,
    };
  }),
]);

// Ensure the password is not exposed
function normalizeUser(user: User) {
  const { id, name, profilePhoto, username } = user;
  return { id, name, profilePhoto, username };
}
