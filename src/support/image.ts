import { IMAGE_SERVING_URL } from './constants';
import { verify } from './signature';

// The single-letter identifier will be encoded into the signed file ID
const supportedImageTypes: Record<string, { type: string; ext: string }> = {
  j: { type: 'image/jpeg', ext: 'jpg' },
  p: { type: 'image/png', ext: 'png' },
};

const imageById = new Map(Object.entries(supportedImageTypes));

export const imageByType = new Map(
  Object.entries(supportedImageTypes).map(([id, { type, ext }]) => {
    return [type, { id, ext }];
  }),
);

export function validateImageFileName(fileName: string) {
  if (!fileName.match(/^\w+\.\w+$/)) {
    return;
  }
  const [id = '', ext = ''] = fileName.split('.');
  if (!verify(id)) {
    return;
  }
  const typeId = id.slice(0, -8).slice(-1);
  const imageDetails = imageById.get(typeId);
  if (!imageDetails || ext !== imageDetails.ext) {
    return;
  }
  return imageDetails;
}

export function toFullyQualifiedUrl(fileName: string) {
  // If it's already a fully qualified URL then return as is
  const [proto] = fileName.split('//');
  if (proto === 'http:' || proto === 'https:') {
    return fileName;
  }
  return IMAGE_SERVING_URL.replace('%FILE_NAME%', fileName);
}
