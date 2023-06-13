export const SECRET_KEY = process.env.SECRET_KEY ?? '';
if (!SECRET_KEY) {
  throw new Error('Environment variable SECRET_KEY not found');
}

export const IMAGE_UPLOAD_URL = process.env.IMAGE_UPLOAD_URL;

export const IMAGE_SERVING_URL = process.env.IMAGE_SERVING_URL ?? '';
if (!IMAGE_SERVING_URL) {
  throw new Error('Environment variable IMAGE_SERVING_URL not found');
}
