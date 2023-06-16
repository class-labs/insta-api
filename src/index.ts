import './env';

import express from 'express';
import cors from 'cors';
// eslint-disable-next-line no-duplicate-imports
import type { NextFunction, Request, Response } from 'express';

import * as handlers from './routes';
import { attachRoutes } from './server';
import { loadPlayground } from './playground/loadPlayground';

const PORT = Number(process.env.PORT || 3000);

const app = express();
app.disable('x-powered-by');
app.use(cors());

const middleware = attachRoutes(...Object.values(handlers));
app.use(middleware);

loadPlayground(app);

app.use((request, response) => {
  response.status(404).json({ error: 'Not Found' });
});

app.use(
  (err: unknown, request: Request, response: Response, _next: NextFunction) => {
    const error = err instanceof Error ? err : new Error(String(err));
    // eslint-disable-next-line no-console
    console.error(error);
    const status: unknown = Object(err).status;
    response
      .status(typeof status === 'number' ? status : 500)
      .json({ error: String(error) });
  },
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${PORT}`);
});
