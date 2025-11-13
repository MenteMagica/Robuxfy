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
  };
}

const userStore = createStore([
  {
    id: uuid(),
    email: 'alex@example.com',
    username: 'alex123',
    displayName: 'Alex The Collector',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: uuid(),
    email: 'jamie@example.com',
    username: 'jamie_art',
    displayName: 'Jamie',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

const artistStore = createStore([
  {
    id: uuid(),
    stageName: 'DJ Nebula',
    genre: 'Electronic',
    description: 'Space inspired beats.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  {
    id: uuid(),
    stageName: 'Luna Sketch',
    genre: 'Indie Pop',
    description: 'Dreamy vocals and guitars.',
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
]);

export { createStore, userStore, artistStore };
