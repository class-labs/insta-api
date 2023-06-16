import { Response } from '@nbit/express';

import { defineRoutes } from '../server';

export default defineRoutes((app) => [
  app.get('/', async (_request) => {
    const html = '<p>Open the <a href="/playground">REST Playground</a></p>';
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }),
]);
