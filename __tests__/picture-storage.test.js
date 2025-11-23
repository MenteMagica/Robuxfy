import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import {
  storeUserPictureUrl,
  MAX_IMAGE_URL_LENGTH,
  __resetDbPool,
} from '../src/data/picture-storage.js';

const originalEnv = { ...process.env };

describe('storeUserPictureUrl', () => {
  beforeEach(() => {
    mock.reset();
    process.env = { ...originalEnv };
    __resetDbPool();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('throws when required database env vars are missing', async () => {
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_NAME;

    await assert.rejects(
      storeUserPictureUrl({ userId: '123', pictureUrl: 'https://img', type: 'profile' }),
      { code: 'DB_NOT_CONFIGURED' }
    );
  });

  test('stores image url and links it to the user', async () => {
    const executeResponses = [[{ insertId: 42 }], [{ affectedRows: 1 }]];
    const execute = mock.fn(async () => executeResponses.shift());

    const connection = {
      beginTransaction: mock.fn(async () => {}),
      execute,
      commit: mock.fn(async () => {}),
      rollback: mock.fn(async () => {}),
      release: mock.fn(async () => {}),
    };

    const pool = {
      getConnection: mock.fn(async () => connection),
    };

    const result = await storeUserPictureUrl(
      {
        userId: 'abc-123',
        pictureUrl: 'https://example.com/avatar.png',
        type: 'profile',
      },
      { pool }
    );

    assert.deepEqual(execute.mock.calls[0].arguments, [
      'INSERT INTO images (type, url) VALUES (?, ?)',
      ['users_profile', 'https://example.com/avatar.png'],
    ]);
    assert.deepEqual(execute.mock.calls[1].arguments, [
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [42, 'abc-123'],
    ]);
    assert.ok(connection.commit.mock.calls.length > 0);
    assert.deepEqual(result, {
      imageId: 42,
      type: 'users_profile',
      url: 'https://example.com/avatar.png',
    });
  });

  test('rolls back when the user does not exist', async () => {
    const executeResponses = [[{ insertId: 99 }], [{ affectedRows: 0 }]];
    const connection = {
      beginTransaction: mock.fn(async () => {}),
      execute: mock.fn(async () => executeResponses.shift()),
      commit: mock.fn(async () => {}),
      rollback: mock.fn(async () => {}),
      release: mock.fn(async () => {}),
    };

    const pool = {
      getConnection: mock.fn(async () => connection),
    };

    await assert.rejects(
      storeUserPictureUrl(
        {
          userId: 'missing-user',
          pictureUrl: 'https://example.com/avatar.png',
          type: 'profile',
        },
        { pool }
      ),
      { code: 'PICTURE_USER_NOT_FOUND' }
    );

    assert.ok(connection.rollback.mock.calls.length > 0);
  });

  test('rejects urls that exceed the maximum length', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(MAX_IMAGE_URL_LENGTH);

    await assert.rejects(
      storeUserPictureUrl({
        userId: 'abc',
        pictureUrl: longUrl,
        type: 'profile',
      }),
      { code: 'INVALID_PICTURE_ARGUMENT' }
    );
  });
});
