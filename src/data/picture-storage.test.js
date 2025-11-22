import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_IMAGE_URL_LENGTH, storeUserPictureUrl } from './picture-storage.js';

const stubUserId = 'user-123';

function createMockPool({ userExists = true } = {}) {
  const calls = [];
  const connection = {
    async beginTransaction() {
      calls.push(['beginTransaction']);
    },
    async execute(sql, params) {
      calls.push(['execute', sql, params]);
      if (sql.startsWith('SELECT')) {
        return [userExists ? [{ id: stubUserId }] : [], []];
      }
      if (sql.startsWith('INSERT')) {
        return [{ insertId: 42 }, []];
      }
      return [[], []];
    },
    async commit() {
      calls.push(['commit']);
    },
    async rollback() {
      calls.push(['rollback']);
    },
    release() {
      calls.push(['release']);
    },
  };

  return {
    calls,
    async getConnection() {
      calls.push(['getConnection']);
      return connection;
    },
  };
}

test('refuses to run when database environment variables are missing', async () => {
  const originalEnv = { ...process.env };
  delete process.env.DB_HOST;
  delete process.env.DB_USER;
  delete process.env.DB_NAME;

  await assert.rejects(
    () =>
      storeUserPictureUrl({
        userId: stubUserId,
        pictureUrl: 'https://example.com/avatar.png',
      }),
    (error) => error.code === 'DB_NOT_CONFIGURED'
  );
  process.env.DB_HOST = originalEnv.DB_HOST;
  process.env.DB_USER = originalEnv.DB_USER;
  process.env.DB_NAME = originalEnv.DB_NAME;
});

test('rolls back when the user does not exist in the database', async () => {
  const mockPool = createMockPool({ userExists: false });

  await assert.rejects(
    () =>
      storeUserPictureUrl({
        userId: stubUserId,
        pictureUrl: 'https://example.com/avatar.png',
        pool: mockPool,
      }),
    (error) => error.code === 'PICTURE_USER_NOT_FOUND'
  );

  assert.deepEqual(mockPool.calls, [
    ['getConnection'],
    ['beginTransaction'],
    ['execute', 'SELECT id FROM users WHERE id = ? LIMIT 1', [stubUserId]],
    ['rollback'],
    ['release'],
  ]);
});

test('writes the image and updates the user using the provided pool', async () => {
  const mockPool = createMockPool({ userExists: true });

  const result = await storeUserPictureUrl({
    userId: stubUserId,
    pictureUrl: '  https://cdn.robuxfy.test/profile.png  ',
    type: 'Cover',
    pool: mockPool,
  });

  assert.equal(result.imageId, 42);
  assert.equal(result.type, 'cover');
  assert.equal(result.url, 'https://cdn.robuxfy.test/profile.png');
  assert.deepEqual(mockPool.calls, [
    ['getConnection'],
    ['beginTransaction'],
    ['execute', 'SELECT id FROM users WHERE id = ? LIMIT 1', [stubUserId]],
    [
      'execute',
      'INSERT INTO images (type, url, user_id) VALUES (?, ?, ?)',
      ['cover', 'https://cdn.robuxfy.test/profile.png', stubUserId],
    ],
    ['execute', 'UPDATE users SET picture_url = ? WHERE id = ?', [42, stubUserId]],
    ['commit'],
    ['release'],
  ]);
});

test('enforces the maximum allowed URL length', async () => {
  const longUrl = 'h'.repeat(MAX_IMAGE_URL_LENGTH + 1);
  await assert.rejects(
    () =>
      storeUserPictureUrl({
        userId: stubUserId,
        pictureUrl: longUrl,
        pool: createMockPool(),
      }),
    (error) => error.code === 'INVALID_PICTURE_ARGUMENT'
  );
});
