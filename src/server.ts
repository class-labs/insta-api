import { HttpError, createApplication } from '@nbit/express';

import { db } from './db';

const { defineRoutes, attachRoutes } = createApplication({
  getContext: (request) => {
    const context = {
      getSession: async () => {
        const authHeader = request.headers.get('Authorization') ?? '';
        const sessionId = authHeader.replace(/^Bearer /i, '');
        return await db.Session.getById(sessionId);
      },
      getCurrentUser: async () => {
        const session = await context.getSession();
        return await db.User.getById(session?.user ?? '');
      },
      authenticate: async () => {
        const user = await context.getCurrentUser();
        if (!user) {
          throw new HttpError({ status: 401 });
        }
        return user;
      },
    };
    return context;
  },
});

export { defineRoutes, attachRoutes };
