import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { resolve } from 'path';

import { HttpError, Response } from '@nbit/express';

import { defineRoutes } from '../server';
import {
  imageByType,
  toFullyQualifiedUrl,
  validateImageFileName,
} from '../support/image';
import { pipeStreamAsync } from '../support/pipeStreamAsync';
import { sign } from '../support/signature';
import { createId } from '../support/createId';
import { createTimestamp } from '../support/timestamp';

const uploadsDirRelative = '../../uploads';
const uploadsDir = resolve(__dirname, uploadsDirRelative);

export default defineRoutes((app) => [
  app.get('/images/:fileName', async (request) => {
    const fileName = request.params.fileName ?? '';
    const imageDetails = validateImageFileName(fileName);
    if (!imageDetails) {
      return;
    }
    const filePath = resolve(uploadsDir, fileName);
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      return;
    }
    const readStream = createReadStream(filePath);
    return new Response(readStream, {
      headers: { 'Content-Type': imageDetails.type },
    });
  }),

  app.post('/images', async (request) => {
    const contentType =
      request.headers.get('content-disposition') ??
      request.headers.get('content-type') ??
      '';
    const imageType = imageByType.get(contentType);
    if (!imageType) {
      throw new HttpError({ status: 400 });
    }
    const id = sign(createTimestamp() + createId() + imageType.id);
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileName = id + '.' + imageType.ext;
    const filePath = resolve(uploadsDir, fileName);
    const writeStream = createWriteStream(filePath);
    await pipeStreamAsync(request.body, writeStream);
    return {
      id,
      fileName,
      url: toFullyQualifiedUrl(fileName),
    };
  }),
]);
