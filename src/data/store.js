import { v4 as uuid } from 'uuid';

const timestamp = () => new Date().toISOString();

function createStore(initialEntities = []) {
  const records = new Map(
    initialEntities.map((entity) => [entity.id, { ...entity }])
  );

  const create = (payload) => {
    const id = uuid();
    const now = timestamp();
    const record = {
      id,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    records.set(id, record);
    return record;
  };

  const getAll = () => Array.from(records.values());

  const find = (predicate) => getAll().filter((record) => predicate(record));

  const some = (predicate) => {
    for (const record of records.values()) {
      if (predicate(record)) {
        return true;
      }
    }
    return false;
  };

  const getById = (id) => records.get(id) ?? null;

  const update = (id, payload) => {
    const existing = records.get(id);
    if (!existing) {
      return null;
    }
    const now = timestamp();
    const updated = {
      ...existing,
      ...payload,
      id,
      updatedAt: now,
    };
    records.set(id, updated);
    return updated;
  };

  const remove = (id) => records.delete(id);

  return {
    create,
    getAll,
    getById,
    update,
    remove,
    find,
    some,
  };
}

const seedArtistUserId = uuid();
const seedSecondArtistUserId = uuid();
const seedStandardUserId = uuid();
const seedAdminUserId = uuid();

const seedFirstArtistId = uuid();
const seedSecondArtistId = uuid();

const userStore = createStore([
  {
    id: seedArtistUserId,
    email: 'alex@example.com',
    username: 'alex123',
    displayName: 'Alex The Collector',
    role: 'artist',
    bio: 'Produces electronic beats and visual art.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: seedSecondArtistUserId,
    email: 'jamie@example.com',
    username: 'jamie_art',
    displayName: 'Jamie',
    role: 'artist',
    bio: 'Indie pop singer and songwriter.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: seedStandardUserId,
    email: 'patricia@example.com',
    username: 'patricia98',
    displayName: 'Patricia',
    role: 'user',
    bio: 'Music fan who loves supporting independent artists.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: seedAdminUserId,
    email: 'admin@example.com',
    username: 'admin',
    displayName: 'Robuxfy Admin',
    role: 'admin',
    bio: 'Keeps the platform organized.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

const artistStore = createStore([
  {
    id: seedFirstArtistId,
    stageName: 'DJ Nebula',
    userId: seedArtistUserId,
    genre: 'Electronic',
    description: 'Space inspired beats.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: seedSecondArtistId,
    stageName: 'Luna Sketch',
    userId: seedSecondArtistUserId,
    genre: 'Indie Pop',
    description: 'Dreamy vocals and guitars.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

const postStore = createStore([
  {
    id: uuid(),
    artistId: seedFirstArtistId,
    title: 'New cosmic beat drop',
    body: 'I just published a new track inspired by meteor showers.',
    visibility: 'public',
    publishedAt: timestamp(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: uuid(),
    artistId: seedSecondArtistId,
    title: 'Acoustic session this weekend',
    body: 'Streaming a stripped-down set on Saturday. Join in!',
    visibility: 'public',
    publishedAt: timestamp(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

const interactionStore = createStore([
  {
    id: uuid(),
    postId: postStore.getAll()[0].id,
    userId: seedStandardUserId,
    type: 'like',
    message: null,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: uuid(),
    postId: postStore.getAll()[0].id,
    userId: seedStandardUserId,
    type: 'comment',
    message: 'This track is amazing! 🔥',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: uuid(),
    postId: postStore.getAll()[1].id,
    userId: seedArtistUserId,
    type: 'view',
    message: null,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

export { createStore, userStore, artistStore, postStore, interactionStore };
