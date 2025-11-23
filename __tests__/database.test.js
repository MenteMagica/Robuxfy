import assert from 'node:assert/strict';
import { beforeEach, describe, test, mock } from 'node:test';

import {
  __resetDbPool,
  getDbPool,
  getMissingDbEnvVars,
} from '../src/data/database.js';

const originalEnv = { ...process.env };

const createFakePool = (connectionLimit = 10) => ({
  marker: 'pool',
  options: connectionLimit,
});

describe('database configuration', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    __resetDbPool();
    mock.restoreAll();
  });

  test('getMissingDbEnvVars flags empty or missing values', () => {
    const env = { DB_HOST: ' ', DB_USER: 'root' };

    assert.deepEqual(getMissingDbEnvVars(env), ['DB_HOST', 'DB_NAME']);
  });

  test('getDbPool throws when required variables are not provided', async () => {
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_NAME;

    await assert.rejects(getDbPool(), { code: 'DB_NOT_CONFIGURED' });
  });

  test('getDbPool reuses the same pool and passes env options to mysql2', async () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'user';
    process.env.DB_NAME = 'robuxfy';
    process.env.DB_PORT = '3307';
    process.env.DB_CONNECTION_LIMIT = '5';

    const createPool = mock.fn((options) => createFakePool(options.connectionLimit));
    const importer = mock.fn(async () => ({ createPool }));

    const first = await getDbPool(process.env, importer);
    const second = await getDbPool(process.env, importer);

    assert.strictEqual(first, second);
    assert.deepEqual(createPool.mock.calls[0].arguments[0], {
      host: 'localhost',
      port: 3307,
      user: 'user',
      password: undefined,
      database: 'robuxfy',
      connectionLimit: 5,
      waitForConnections: true,
    });
  });
});
