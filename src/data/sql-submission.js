import { getDbPool } from './database.js';

const SEARCH_CONTENT_SQL = `
  (SELECT name AS text, 'artist' AS type FROM artists WHERE name LIKE CONCAT('%', ?, '%') LIMIT 1)
  UNION ALL
  (SELECT title AS text, 'music' AS type FROM musics WHERE title LIKE CONCAT('%', ?, '%') LIMIT 4)
  UNION ALL
  (SELECT title AS text, 'podcast' AS type FROM podcasts WHERE title LIKE CONCAT('%', ?, '%') LIMIT 3)
  UNION ALL
  (SELECT name AS text, 'album' AS type FROM albums WHERE name LIKE CONCAT('%', ?, '%') LIMIT 2);
`;

const sanitizeScalar = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  if (typeof value === 'number') {
    return value;
  }
  return undefined;
};

const sanitizeImage = (image, fallbackType) => {
  if (!image || typeof image !== 'object') {
    return undefined;
  }
  const url = sanitizeScalar(image.url);
  if (!url) {
    return undefined;
  }
  const type = sanitizeScalar(image.type) ?? fallbackType;
  if (!type) {
    return undefined;
  }
  return { type, url };
};

const dropUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );

const sanitizeArtists = (artists) => {
  if (!Array.isArray(artists)) {
    return undefined;
  }
  const normalized = artists
    .map((artist) => {
      if (typeof artist === 'number') {
        return artist;
      }
      if (typeof artist === 'string' && artist.trim() !== '') {
        const asNumber = Number.parseInt(artist.trim(), 10);
        return Number.isNaN(asNumber) ? undefined : asNumber;
      }
      return undefined;
    })
    .filter((value) => value !== undefined);

  return normalized.length > 0 ? normalized : undefined;
};

const sanitizeMusic = (music) => {
  if (!music || typeof music !== 'object') {
    return undefined;
  }

  const base = dropUndefined({
    title: sanitizeScalar(music.title),
    release_date: sanitizeScalar(music.release_date),
    url: sanitizeScalar(music.url),
    album_id: sanitizeScalar(music.album_id),
    artists: sanitizeArtists(music.artists),
  });

  if (!base.title || !base.url) {
    return undefined;
  }

  return base;
};

const sanitizeMusics = (musics) => {
  if (!Array.isArray(musics)) {
    return undefined;
  }
  const normalized = musics
    .map((music) => sanitizeMusic(music))
    .filter((entry) => entry !== undefined);
  return normalized.length > 0 ? normalized : undefined;
};

const buildUserPayload = (payload) => {
  const base = dropUndefined({
    username: sanitizeScalar(payload.username),
    date_of_birth: sanitizeScalar(payload.date_of_birth),
    email: sanitizeScalar(payload.email),
    password_hash: sanitizeScalar(payload.password_hash),
  });

  const profile_picture = sanitizeImage(payload.profile_picture, 'users_profile');
  if (profile_picture) {
    base.profile_picture = profile_picture;
  }

  return base;
};

const buildArtistPayload = (payload) => {
  const base = dropUndefined({
    user_id: sanitizeScalar(payload.user_id),
    name: sanitizeScalar(payload.name),
    biography: sanitizeScalar(payload.biography),
  });

  const banner = sanitizeImage(payload.banner, 'artists_banner');
  if (banner) {
    base.banner = banner;
  }

  return base;
};

const buildMusicPayload = (payload) => {
  const base = dropUndefined({
    title: sanitizeScalar(payload.title),
    release_date: sanitizeScalar(payload.release_date),
    url: sanitizeScalar(payload.url),
    album_id: sanitizeScalar(payload.album_id),
    artists: sanitizeArtists(payload.artists),
  });

  const cover_image = sanitizeImage(payload.cover_image, 'musics_cover');
  if (cover_image) {
    base.cover_image = cover_image;
  }

  return base;
};

const buildAlbumPayload = (payload) => {
  const base = dropUndefined({
    name: sanitizeScalar(payload.name),
    release_date: sanitizeScalar(payload.release_date),
    artist_id: sanitizeScalar(payload.artist_id),
  });

  const cover_image = sanitizeImage(payload.cover_image, 'albums_cover');
  if (cover_image) {
    base.cover_image = cover_image;
  }

  const musics = sanitizeMusics(payload.musics);
  if (musics) {
    base.musics = musics;
  }

  return base;
};

const buildPodcastPayload = (payload) => {
  const base = dropUndefined({
    title: sanitizeScalar(payload.title),
    description: sanitizeScalar(payload.description),
    release_date: sanitizeScalar(payload.release_date),
    artist_id: sanitizeScalar(payload.artist_id),
  });

  const cover_image = sanitizeImage(payload.cover_image, 'podcasts_cover');
  if (cover_image) {
    base.cover_image = cover_image;
  }

  return base;
};

async function submitUser(payload, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const cleaned = buildUserPayload(payload ?? {});
  await dbPool.execute('CALL create_user(?)', [JSON.stringify(cleaned)]);
  return cleaned;
}

async function submitArtist(payload, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const cleaned = buildArtistPayload(payload ?? {});
  await dbPool.execute('CALL create_artist(?)', [JSON.stringify(cleaned)]);
  return cleaned;
}

async function submitSingleMusic(payload, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const cleaned = buildMusicPayload(payload ?? {});
  await dbPool.execute('CALL create_single_music(?)', [JSON.stringify(cleaned)]);
  return cleaned;
}

async function submitAlbumWithMusics(payload, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const cleaned = buildAlbumPayload(payload ?? {});
  await dbPool.execute('CALL create_album_with_musics(?)', [
    JSON.stringify(cleaned),
  ]);
  return cleaned;
}

async function submitPodcast(payload, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const cleaned = buildPodcastPayload(payload ?? {});
  await dbPool.execute('CALL create_podcast(?)', [JSON.stringify(cleaned)]);
  return cleaned;
}

async function searchContent(term, { pool } = {}) {
  const dbPool = pool ?? (await getDbPool());
  const keyword = sanitizeScalar(term) ?? '';
  const [rows] = await dbPool.execute(SEARCH_CONTENT_SQL, [
    keyword,
    keyword,
    keyword,
    keyword,
  ]);
  return rows;
}

export {
  SEARCH_CONTENT_SQL,
  buildAlbumPayload,
  buildArtistPayload,
  buildMusicPayload,
  buildPodcastPayload,
  buildUserPayload,
  searchContent,
  submitAlbumWithMusics,
  submitArtist,
  submitPodcast,
  submitSingleMusic,
  submitUser,
};
