import { Router } from 'express';
import { artistStore } from '../data/store.js';

const artistsRouter = Router();

artistsRouter.get('/', (req, res) => {
  res.json(artistStore.getAll());
});

artistsRouter.get('/:id', (req, res) => {
  const artist = artistStore.getById(req.params.id);
  if (!artist) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Artist with id ${req.params.id} does not exist`,
    });
  }
  res.json(artist);
});

artistsRouter.post('/', (req, res) => {
  const { stageName, genre, description } = req.body ?? {};
  if (!stageName) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'stageName is required',
    });
  }
  const created = artistStore.create({
    stageName,
    genre: genre ?? null,
    description: description ?? null,
  });
  res.status(201).json(created);
});

artistsRouter.put('/:id', (req, res) => {
  const { stageName, genre, description } = req.body ?? {};
  if (!stageName && !genre && !description) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Provide at least one of stageName, genre, or description',
    });
  }
  const updated = artistStore.update(req.params.id, {
    ...(stageName && { stageName }),
    ...(genre && { genre }),
    ...(description && { description }),
  });
  if (!updated) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Artist with id ${req.params.id} does not exist`,
    });
  }
  res.json(updated);
});

artistsRouter.delete('/:id', (req, res) => {
  const deleted = artistStore.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Artist with id ${req.params.id} does not exist`,
    });
  }
  res.status(204).send();
});

export default artistsRouter;
