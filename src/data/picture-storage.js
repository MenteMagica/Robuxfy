import { getDbPool, __resetDbPool } from './database.js';

const MAX_IMAGE_URL_LENGTH = 1024;
const validImageTypes = ['profile', 'banner', 'gallery'];

const dbImageType = {
  profile: 'users_profile',
  banner: 'artists_banner',
  gallery: 'playlists_cover',
};

async function storeUserPictureUrl(
  { userId, pictureUrl, type = 'profile' },
  { pool } = {}
) {
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

  const normalizedType = type?.trim().toLowerCase() || 'profile';
  if (!validImageTypes.includes(normalizedType)) {
    const error = new Error(
      `type must be one of: ${validImageTypes.join(', ')}`
    );
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  const sanitizedUrl = pictureUrl.trim();
  if (sanitizedUrl.length > MAX_IMAGE_URL_LENGTH) {
    const error = new Error(
      `pictureUrl must be at most ${MAX_IMAGE_URL_LENGTH} characters long`
    );
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  const dbPool = pool ?? (await getDbPool());
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [imageResult] = await connection.execute(
      'INSERT INTO images (type, url) VALUES (?, ?)',
      [dbImageType[normalizedType], sanitizedUrl]
    );
    const imageId = imageResult.insertId;

    const [userResult] = await connection.execute(
      'UPDATE users SET picture_url = ? WHERE id = ?',
      [imageId, userId]
    );

    if (userResult.affectedRows === 0) {
      const error = new Error(`User with id ${userId} was not found`);
      error.code = 'PICTURE_USER_NOT_FOUND';
      throw error;
    }

    await connection.commit();

    return { imageId, type: dbImageType[normalizedType], url: sanitizedUrl };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { MAX_IMAGE_URL_LENGTH, validImageTypes, storeUserPictureUrl, __resetDbPool };
