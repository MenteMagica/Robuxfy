import { Router } from 'express';
import { userStore } from '../data/store.js';

const usersRouter = Router();

usersRouter.get('/', (req, res) => {
  res.json(userStore.getAll());
});

usersRouter.get('/:id', (req, res) => {
  const user = userStore.getById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} does not exist`,
    });
  }
  res.json(user);
});

usersRouter.post('/', (req, res) => {
  const { email, username, displayName } = req.body ?? {};
  if (!email || !username || !displayName) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'email, username, and displayName are required',
    });
  }
  const created = userStore.create({ email, username, displayName });
  res.status(201).json(created);
});

usersRouter.put('/:id', (req, res) => {
  const { email, username, displayName } = req.body ?? {};
  if (!email && !username && !displayName) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Provide at least one of email, username, or displayName',
    });
  }
  const updated = userStore.update(req.params.id, {
    ...(email && { email }),
    ...(username && { username }),
    ...(displayName && { displayName }),
  });
  if (!updated) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} does not exist`,
    });
  }
  res.json(updated);
});

usersRouter.delete('/:id', (req, res) => {
  const deleted = userStore.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${req.params.id} does not exist`,
    });
  }
  res.status(204).send();
});

export default usersRouter;
