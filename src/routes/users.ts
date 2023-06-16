import { HttpError, Response } from '@nbit/express';

import { defineRoutes } from '../server';
import { db } from '../db';
import { schema } from '../support/schema';

import { normalizeUser } from './helpers/normalize';

const LoginInput = schema(({ Record, String }) => {
  return Record({
    username: String,
    password: String,
  });
});

const UserCreateInput = schema(({ Record, String }) => {
  return Record({
    name: String,
    profilePhoto: String.optional(),
    username: String,
    password: String,
  });
});

const UserUpdateInput = schema(({ Record, String }) => {
  return Record({
    name: String,
    profilePhoto: String,
    username: String,
    password: String,
  }).asPartial();
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

  app.get('/me', async (request) => {
    const user = await request.authenticate();
    if (!user) {
      throw new HttpError({ status: 401 });
    }
    return normalizeUser(user);
  }),

  app.post('/login', async (request) => {
    const body = await request.json();
    if (!LoginInput.guard(body)) {
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
      user: normalizeUser(user),
      token: session.id,
    };
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

  app.post('/logout', async (request) => {
    const session = await request.getSession();
    if (session) {
      await db.Session.delete(session.id);
      return { success: true };
    } else {
      return { success: false };
    }
  }),

  app.post('/users/:id', async (request) => {
    const user = await request.authenticate();
    const userId = request.params.id;
    // TODO: Allow admin
    if (userId !== user.id) {
      throw new HttpError({ status: 400 });
    }
    const body = await request.json();
    if (!UserUpdateInput.guard(body)) {
      throw new HttpError({ status: 400 });
    }
    const { name, profilePhoto, username, password } = body;
    if (username !== undefined) {
      if (!username.length || username.match(/\W/)) {
        throw new HttpError({ status: 400, message: 'Invalid username' });
      }
      const existingUsers = await db.User.findWhere(
        (user) =>
          user.id !== userId &&
          user.username.toLowerCase() === username.toLowerCase(),
      );
      if (existingUsers.length) {
        throw new HttpError({
          status: 400,
          message: 'Username already exists',
        });
      }
    }
    const newUser = await db.User.update(user.id, {
      name,
      profilePhoto,
      username,
      password,
    });
    return normalizeUser(newUser ?? user);
  }),
]);
