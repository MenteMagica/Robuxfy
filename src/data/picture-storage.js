import { v4 as uuid } from 'uuid';
import { getDbPool, readDbConfig } from '../utils/db.js';

const MAX_IMAGE_URL_LENGTH = 2047;
const validImageTypes = ['profile', 'cover'];

async function storeUserPictureUrl({ userId, pictureUrl, type = 'profile', pool }) {
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

  const sanitizedUrl = pictureUrl.trim();
  if (sanitizedUrl.length === 0 || sanitizedUrl.length > MAX_IMAGE_URL_LENGTH) {
    const error = new Error(
      `pictureUrl must be a non-empty string up to ${MAX_IMAGE_URL_LENGTH} characters long`
    );
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  const normalizedType = type?.trim()?.toLowerCase() ?? 'profile';
  if (!validImageTypes.includes(normalizedType)) {
    const error = new Error(`type must be one of: ${validImageTypes.join(', ')}`);
    error.code = 'INVALID_PICTURE_ARGUMENT';
    throw error;
  }

  let dbPool = pool;
  if (!dbPool) {
    try {
      readDbConfig();
    } catch (error) {
      throw error;
    }
    dbPool = await getDbPool();
  }

  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!users.length) {
      const error = new Error(`User with id ${userId} was not found in the database`);
      error.code = 'PICTURE_USER_NOT_FOUND';
      throw error;
    }

    const [insertResult] = await connection.execute(
      'INSERT INTO images (type, url, user_id) VALUES (?, ?, ?)',
      [normalizedType, sanitizedUrl, userId]
    );
    const imageId = insertResult.insertId || uuid();

    await connection.execute('UPDATE users SET picture_url = ? WHERE id = ?', [
      imageId,
      userId,
    ]);
    await connection.commit();

    return { imageId, type: normalizedType, url: sanitizedUrl };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { MAX_IMAGE_URL_LENGTH, validImageTypes, storeUserPictureUrl };
