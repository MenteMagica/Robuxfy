import { v4 as uuid } from 'uuid';

const MAX_IMAGE_URL_LENGTH = 1024;
const validImageTypes = ['profile', 'banner', 'gallery'];

async function storeUserPictureUrl({ userId, pictureUrl, type = 'profile' }) {
  if (!userId || typeof userId !== 'string') {
    const error = new Error('userId must be provided');
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  if (!pictureUrl || typeof pictureUrl !== 'string') {
    const error = new Error('pictureUrl must be provided as a string');
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  if (!validImageTypes.includes(type)) {
    const error = new Error(`type must be one of: ${validImageTypes.join(', ')}`);
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  return {
    imageId: uuid(),
    type,
    url: pictureUrl.trim(),
  };
}

export { MAX_IMAGE_URL_LENGTH, validImageTypes, storeUserPictureUrl };
