import { Router } from 'express';
import {
  artistStore,
  interactionStore,
  postStore,
  userStore,
} from '../data/store.js';
import HttpError from '../errors/http-error.js';
import { normalize, requireFields } from '../utils/validation.js';

const artistsRouter = Router();

artistsRouter.get('/', (req, res) => {
  const { genre, search } = req.query;
  let artists = artistStore.getAll();
  if (genre) {
    const needle = normalize(genre);
    artists = artists.filter(
      (artist) => normalize(artist.genre ?? '') === needle
    );
  }
  if (search) {
    const needle = normalize(search);
    artists = artists.filter((artist) =>
      normalize(artist.stageName).includes(needle) ||
      normalize(artist.description ?? '').includes(needle)
    );
  }
  res.json(artists);
});

artistsRouter.get('/:id/overview', (req, res, next) => {
  const artist = artistStore.getById(req.params.id);
  if (!artist) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }

  const posts = postStore.find((post) => post.artistId === artist.id);
  const interactions = interactionStore.find((interaction) =>
    posts.some((post) => post.id === interaction.postId)
  );
  const interactionsByType = interactions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    artist,
    posts,
    metrics: {
      totalPosts: posts.length,
      totalInteractions: interactions.length,
      interactionsByType,
    },
  });
});

artistsRouter.get('/:id', (req, res, next) => {
  const artist = artistStore.getById(req.params.id);
  if (!artist) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }
  res.json(artist);
});

artistsRouter.post('/', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['stageName']);
  if (missing) {
    return next(
      HttpError.badRequest(`Missing required field: ${missing.join(', ')}`)
    );
  }

  const normalizedStageName = normalize(payload.stageName);
  if (
    artistStore.some(
      (artist) => normalize(artist.stageName) === normalizedStageName
    )
  ) {
    return next(HttpError.conflict('stageName is already in use'));
  }

  let userId = null;
  if (payload.userId !== undefined) {
    if (typeof payload.userId !== 'string' || payload.userId.trim() === '') {
      return next(
        HttpError.badRequest('userId must be provided as a non-empty string')
      );
    }
    const user = userStore.getById(payload.userId.trim());
    if (!user) {
      return next(HttpError.notFound('userId does not match any user'));
    }
    if (user.role !== 'artist') {
      return next(
        HttpError.badRequest('userId must belong to a user with artist role')
      );
    }
    userId = user.id;
  }

  const created = artistStore.create({
    stageName: payload.stageName.trim(),
    userId,
    genre: payload.genre?.trim() ?? null,
    description: payload.description?.trim() ?? null,
  });
  res.status(201).json(created);
});

artistsRouter.put('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['stageName']);
  if (missing) {
    return next(
      HttpError.badRequest(`Missing required field: ${missing.join(', ')}`)
    );
  }

  const existing = artistStore.getById(req.params.id);
  if (!existing) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }

  const normalizedStageName = normalize(payload.stageName);
  if (
    normalizedStageName !== normalize(existing.stageName) &&
    artistStore.some(
      (artist) =>
        artist.id !== existing.id &&
        normalize(artist.stageName) === normalizedStageName
    )
  ) {
    return next(HttpError.conflict('stageName is already in use'));
  }

  let userId = existing.userId ?? null;
  if (payload.userId !== undefined) {
    if (typeof payload.userId !== 'string' || payload.userId.trim() === '') {
      return next(
        HttpError.badRequest('userId must be provided as a non-empty string')
      );
    }
    const user = userStore.getById(payload.userId.trim());
    if (!user) {
      return next(HttpError.notFound('userId does not match any user'));
    }
    if (user.role !== 'artist') {
      return next(
        HttpError.badRequest('userId must belong to a user with artist role')
      );
    }
    userId = user.id;
  }

  const updated = artistStore.update(req.params.id, {
    stageName: payload.stageName.trim(),
    userId,
    genre:
      payload.genre !== undefined ? payload.genre?.trim() ?? null : existing.genre,
    description:
      payload.description !== undefined
        ? payload.description?.trim() ?? null
        : existing.description,
  });

  res.json(updated);
});

artistsRouter.patch('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const { stageName, genre, description } = payload;
  if (
    stageName === undefined &&
    genre === undefined &&
    description === undefined &&
    payload.userId === undefined
  ) {
    return next(
      HttpError.badRequest(
        'Provide at least one of stageName, genre, description, or userId'
      )
    );
  }

  const existing = artistStore.getById(req.params.id);
  if (!existing) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }

  const updates = {};

  if (stageName !== undefined) {
    const normalizedStageName = normalize(stageName);
    if (
      normalizedStageName !== normalize(existing.stageName) &&
      artistStore.some(
        (artist) =>
          artist.id !== existing.id &&
          normalize(artist.stageName) === normalizedStageName
      )
    ) {
      return next(HttpError.conflict('stageName is already in use'));
    }
    updates.stageName = stageName.trim();
  }

  if (genre !== undefined) {
    updates.genre = genre?.trim() ?? null;
  }

  if (description !== undefined) {
    updates.description = description?.trim() ?? null;
  }

  if (payload.userId !== undefined) {
    if (typeof payload.userId !== 'string' || payload.userId.trim() === '') {
      return next(
        HttpError.badRequest('userId must be provided as a non-empty string')
      );
    }
    const user = userStore.getById(payload.userId.trim());
    if (!user) {
      return next(HttpError.notFound('userId does not match any user'));
    }
    if (user.role !== 'artist') {
      return next(
        HttpError.badRequest('userId must belong to a user with artist role')
      );
    }
    updates.userId = user.id;
  }

  const updated = artistStore.update(req.params.id, updates);
  res.json(updated);
});

artistsRouter.get('/:id/posts', (req, res, next) => {
  const artist = artistStore.getById(req.params.id);
  if (!artist) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }

  const posts = postStore.find((post) => post.artistId === artist.id);
  res.json(posts);
});

artistsRouter.post('/:id/posts', (req, res, next) => {
  const artist = artistStore.getById(req.params.id);
  if (!artist) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }

  const payload = req.body ?? {};
  const missing = requireFields(payload, ['title', 'body']);
  if (missing) {
    return next(
      HttpError.badRequest(
        `Missing required fields: ${missing.join(', ')}`
      )
    );
  }

  const normalizedVisibility =
    typeof payload.visibility === 'string' && payload.visibility.trim() !== ''
      ? payload.visibility.trim().toLowerCase()
      : 'public';

  const created = postStore.create({
    artistId: artist.id,
    title: payload.title.trim(),
    body: payload.body.trim(),
    visibility: normalizedVisibility,
    publishedAt: new Date().toISOString(),
  });

  res.status(201).json(created);
});

artistsRouter.delete('/:id', (req, res, next) => {
  const deleted = artistStore.remove(req.params.id);
  if (!deleted) {
    return next(
      HttpError.notFound(`Artist with id ${req.params.id} does not exist`)
    );
  }
  res.status(204).send();
});

export default artistsRouter;
