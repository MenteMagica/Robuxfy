import assert from 'node:assert/strict';
import { beforeEach, describe, mock, test } from 'node:test';

import {
  SEARCH_CONTENT_SQL,
  buildAlbumPayload,
  buildUserPayload,
  searchContent,
  submitAlbumWithMusics,
  submitSingleMusic,
  submitUser,
} from '../src/data/sql-submission.js';

const originalEnv = { ...process.env };

const createMockPool = () => ({
  execute: mock.fn(async () => [[]]),
});

describe('SQL submission helpers', () => {
  beforeEach(() => {
    mock.reset();
    process.env = { ...originalEnv };
  });

  test('searchContent queries artists, musics, podcasts, and albums in order', async () => {
    const pool = createMockPool();

    await searchContent('rock', { pool });

    const [sql, params] = pool.execute.mock.calls[0].arguments;
    assert.equal(sql.trim(), SEARCH_CONTENT_SQL.trim());
    assert.deepEqual(params, ['rock', 'rock', 'rock', 'rock']);
  });

  test('submitUser drops empty profile pictures before calling the procedure', async () => {
    const pool = createMockPool();

    const cleaned = await submitUser(
      {
        username: ' usuario123 ',
        date_of_birth: '1995-08-15',
        email: 'usuario@example.com ',
        password_hash: ' hash_da_senha_aqui ',
        profile_picture: { url: '   ', type: 'users_profile' },
      },
      { pool }
    );

    const payload = JSON.parse(pool.execute.mock.calls[0].arguments[1][0]);
    assert.deepEqual(payload, {
      username: 'usuario123',
      date_of_birth: '1995-08-15',
      email: 'usuario@example.com',
      password_hash: 'hash_da_senha_aqui',
    });
    assert.deepEqual(cleaned, payload);
  });

  test('submitSingleMusic keeps sanitized cover image and artists', async () => {
    const pool = createMockPool();

    const cleaned = await submitSingleMusic(
      {
        title: ' Minha Música ',
        release_date: '2025-01-01',
        url: ' https://exemplo.com/audio/musica.mp3 ',
        album_id: 1,
        cover_image: { type: 'musics_cover', url: ' https://exemplo.com/images/capa.png ' },
        artists: [10, '14', ''],
      },
      { pool }
    );

    const payload = JSON.parse(pool.execute.mock.calls[0].arguments[1][0]);
    const expected = {
      title: 'Minha Música',
      release_date: '2025-01-01',
      url: 'https://exemplo.com/audio/musica.mp3',
      album_id: 1,
      cover_image: {
        type: 'musics_cover',
        url: 'https://exemplo.com/images/capa.png',
      },
      artists: [10, 14],
    };

    assert.deepEqual(payload, expected);
    assert.deepEqual(cleaned, expected);
  });

  test('submitAlbumWithMusics sanitizes nested music entries', async () => {
    const pool = createMockPool();

    const cleaned = await submitAlbumWithMusics(
      {
        name: ' Greatest Hits ',
        release_date: '2025-01-01',
        artist_id: 1,
        cover_image: { url: 'https://exemplo.com/images/album_capa.png' },
        musics: [
          {
            title: 'Música 1',
            release_date: '2025-01-01',
            url: 'https://exemplo.com/audio/musica1.mp3',
            artists: [10, 14, 22],
          },
          {
            title: 'Música 2',
            release_date: '2025-01-02',
            url: 'https://exemplo.com/audio/musica2.mp3',
            artists: [10],
          },
        ],
      },
      { pool }
    );

    const payload = JSON.parse(pool.execute.mock.calls[0].arguments[1][0]);
    const expected = {
      name: 'Greatest Hits',
      release_date: '2025-01-01',
      artist_id: 1,
      cover_image: {
        type: 'albums_cover',
        url: 'https://exemplo.com/images/album_capa.png',
      },
      musics: [
        {
          title: 'Música 1',
          release_date: '2025-01-01',
          url: 'https://exemplo.com/audio/musica1.mp3',
          artists: [10, 14, 22],
        },
        {
          title: 'Música 2',
          release_date: '2025-01-02',
          url: 'https://exemplo.com/audio/musica2.mp3',
          artists: [10],
        },
      ],
    };

    assert.deepEqual(payload, expected);
    assert.deepEqual(cleaned, expected);
  });

  test('buildAlbumPayload ignores invalid music entries', () => {
    const payload = buildAlbumPayload({
      name: 'Invalid album',
      musics: [
        {
          title: '',
          url: 'https://exemplo.com/audio/broken.mp3',
        },
        123,
      ],
    });

    assert.deepEqual(payload, {
      name: 'Invalid album',
    });
  });
});
