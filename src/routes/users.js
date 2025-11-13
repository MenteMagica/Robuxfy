import { Router } from 'express';
import { userStore } from '../data/store.js';
import HttpError from '../errors/http-error.js';
import {
  ensureValidEmail,
  normalize,
  requireFields,
} from '../utils/validation.js';

const usersRouter = Router();

usersRouter.get('/', (req, res) => {
  const { email, username, search } = req.query;
  let users = userStore.getAll();
  if (email) {
    const needle = normalize(email);
    users = users.filter((user) => normalize(user.email) === needle);
  }
  if (username) {
    const needle = normalize(username);
    users = users.filter((user) => normalize(user.username) === needle);
  }
  if (search) {
    const needle = normalize(search);
    users = users.filter((user) =>
      normalize(user.displayName).includes(needle) ||
      normalize(user.username).includes(needle)
    );
  }
  res.json(users);
});

usersRouter.get('/:id', (req, res, next) => {
  const user = userStore.getById(req.params.id);
  if (!user) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }
  res.json(user);
});

usersRouter.post('/', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['email', 'username', 'displayName']);
  if (missing) {
    return next(
      HttpError.badRequest(
        `Missing required fields: ${missing.join(', ')}`
      )
    );
  }

  if (!ensureValidEmail(payload.email)) {
    return next(HttpError.badRequest('email must be a valid email address'));
  }

  const normalizedEmail = normalize(payload.email);
  if (userStore.some((user) => normalize(user.email) === normalizedEmail)) {
    return next(HttpError.conflict('Email is already in use'));
  }

  const normalizedUsername = normalize(payload.username);
  if (
    userStore.some(
      (user) => normalize(user.username) === normalizedUsername
    )
  ) {
    return next(HttpError.conflict('Username is already in use'));
  }

  const created = userStore.create({
    email: payload.email.trim().toLowerCase(),
    username: payload.username.trim(),
    displayName: payload.displayName.trim(),
  });
  res.status(201).json(created);
});

usersRouter.put('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['email', 'username', 'displayName']);
  if (missing) {
    return next(
      HttpError.badRequest(
        `Missing required fields: ${missing.join(', ')}`
      )
    );
  }

  const existing = userStore.getById(req.params.id);
  if (!existing) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }

  if (!ensureValidEmail(payload.email)) {
    return next(HttpError.badRequest('email must be a valid email address'));
  }

  const normalizedEmail = normalize(payload.email);
  if (
    normalizedEmail !== normalize(existing.email) &&
    userStore.some(
      (user) => user.id !== existing.id && normalize(user.email) === normalizedEmail
    )
  ) {
    return next(HttpError.conflict('Email is already in use'));
  }

  const normalizedUsername = normalize(payload.username);
  if (
    normalizedUsername !== normalize(existing.username) &&
    userStore.some(
      (user) =>
        user.id !== existing.id &&
        normalize(user.username) === normalizedUsername
    )
  ) {
    return next(HttpError.conflict('Username is already in use'));
  }

  const updated = userStore.update(req.params.id, {
    email: payload.email.trim().toLowerCase(),
    username: payload.username.trim(),
    displayName: payload.displayName.trim(),
  });

  res.json(updated);
});

usersRouter.patch('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const { email, username, displayName } = payload;
  if (email === undefined && username === undefined && displayName === undefined) {
    return next(
      HttpError.badRequest(
        'Provide at least one of email, username, or displayName'
      )
    );
  }

  const existing = userStore.getById(req.params.id);
  if (!existing) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }

  const updates = {};

  if (email !== undefined) {
    if (!ensureValidEmail(email)) {
      return next(HttpError.badRequest('email must be a valid email address'));
    }
    const normalizedEmail = normalize(email);
    if (
      normalizedEmail !== normalize(existing.email) &&
      userStore.some(
        (user) =>
          user.id !== existing.id && normalize(user.email) === normalizedEmail
      )
    ) {
      return next(HttpError.conflict('Email is already in use'));
    }
    updates.email = email.trim().toLowerCase();
  }

  if (username !== undefined) {
    const normalizedUsername = normalize(username);
    if (
      normalizedUsername !== normalize(existing.username) &&
      userStore.some(
        (user) =>
          user.id !== existing.id &&
          normalize(user.username) === normalizedUsername
      )
    ) {
      return next(HttpError.conflict('Username is already in use'));
    }
    updates.username = username.trim();
  }

  if (displayName !== undefined) {
    updates.displayName = displayName.trim();
  }

  const updated = userStore.update(req.params.id, updates);
  res.json(updated);
});

usersRouter.delete('/:id', (req, res, next) => {
  const deleted = userStore.remove(req.params.id);
  if (!deleted) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }
  res.status(204).send();
});

export default usersRouter;
