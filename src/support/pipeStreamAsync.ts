import type { Readable, Writable } from 'stream';

export function pipeStreamAsync(readStream: Readable, writeStream: Writable) {
  return new Promise<void>((resolve, reject) => {
    readStream
      .pipe(writeStream)
      .on('close', () => resolve())
      .on('error', (error) => reject(error));
  });
}
