import { Router } from 'express';
import { artistStore } from '../data/store.js';
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

  const created = artistStore.create({
    stageName: payload.stageName.trim(),
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

  const updated = artistStore.update(req.params.id, {
    stageName: payload.stageName.trim(),
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
  if (stageName === undefined && genre === undefined && description === undefined) {
    return next(
      HttpError.badRequest(
        'Provide at least one of stageName, genre, or description'
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

  const updated = artistStore.update(req.params.id, updates);
  res.json(updated);
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
