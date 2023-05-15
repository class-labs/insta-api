import './env';

import express from 'express';
import cors from 'cors';

const PORT = Number(process.env.PORT || 3000);

const app = express();
app.disable('x-powered-by');
app.use(cors());

app.get('/', (request, response) => {
  response.send(`<p>Hello world</p>`);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${PORT}`);
});
