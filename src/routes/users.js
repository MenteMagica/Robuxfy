import { Router } from 'express';
import {
  artistStore,
  interactionStore,
  postStore,
  userStore,
} from '../data/store.js';
import {
  MAX_IMAGE_URL_LENGTH,
  storeUserPictureUrl,
  validImageTypes,
} from '../data/picture-storage.js';
import HttpError from '../errors/http-error.js';
import {
  ensureValidEmail,
  normalize,
  requireFields,
} from '../utils/validation.js';

const usersRouter = Router();
const allowedPictureTypes = new Set(validImageTypes);
const allowedRoles = new Set(['user', 'artist', 'admin']);

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

usersRouter.get('/:id/overview', (req, res, next) => {
  const user = userStore.getById(req.params.id);
  if (!user) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }

  const artistProfile = artistStore.find(
    (artist) => artist.userId === user.id
  )[0];
  const authoredPosts = artistProfile
    ? postStore.find((post) => post.artistId === artistProfile.id)
    : [];
  const interactions = interactionStore.find(
    (interaction) => interaction.userId === user.id
  );
  const interactionsByType = interactions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    user,
    profile: {
      role: user.role,
      bio: user.bio ?? null,
      artist: artistProfile ?? null,
    },
    activity: {
      totalInteractions: interactions.length,
      interactionsByType,
      authoredPosts,
    },
  });
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
  const missing = requireFields(payload, [
    'email',
    'username',
    'displayName',
  ]);
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

  const normalizedRole = normalize(payload.role || 'user');
  if (!allowedRoles.has(normalizedRole)) {
    return next(
      HttpError.badRequest(
        `role must be one of: ${Array.from(allowedRoles).join(', ')}`
      )
    );
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
    role: normalizedRole,
    bio:
      payload.bio !== undefined && payload.bio !== null
        ? payload.bio.trim()
        : null,
  });
  res.status(201).json(created);
});

usersRouter.put('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, [
    'email',
    'username',
    'displayName',
    'role',
  ]);
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
    role: normalizedRole,
    bio:
      payload.bio !== undefined && payload.bio !== null
        ? payload.bio.trim()
        : null,
  });

  res.json(updated);
});

usersRouter.patch('/:id', (req, res, next) => {
  const payload = req.body ?? {};
  const { email, username, displayName, role, bio } = payload;
  if (
    email === undefined &&
    username === undefined &&
    displayName === undefined &&
    role === undefined &&
    bio === undefined
  ) {
    return next(
      HttpError.badRequest(
        'Provide at least one of email, username, displayName, role, or bio'
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

  if (role !== undefined) {
    const normalizedRole = normalize(role);
    if (!allowedRoles.has(normalizedRole)) {
      return next(
        HttpError.badRequest(
          `role must be one of: ${Array.from(allowedRoles).join(', ')}`
        )
      );
    }
    updates.role = normalizedRole;
  }

  if (bio !== undefined) {
    updates.bio = bio?.trim() ?? null;
  }

  const updated = userStore.update(req.params.id, updates);
  res.json(updated);
});

usersRouter.post('/:id/picture', async (req, res, next) => {
  const existing = userStore.getById(req.params.id);
  if (!existing) {
    return next(
      HttpError.notFound(`User with id ${req.params.id} does not exist`)
    );
  }

  const payload = req.body ?? {};
  const rawPictureUrl = payload.pictureUrl;
  if (typeof rawPictureUrl !== 'string' || rawPictureUrl.trim() === '') {
    return next(
      HttpError.badRequest('pictureUrl must be provided as a non-empty string')
    );
  }
  const sanitizedUrl = rawPictureUrl.trim();
  if (sanitizedUrl.length > MAX_IMAGE_URL_LENGTH) {
    return next(
      HttpError.badRequest(
        `pictureUrl must be at most ${MAX_IMAGE_URL_LENGTH} characters long`
      )
    );
  }

  const normalizedType =
    typeof payload.type === 'string' && payload.type.trim()
      ? payload.type.trim().toLowerCase()
      : 'profile';
  if (!allowedPictureTypes.has(normalizedType)) {
    return next(
      HttpError.badRequest(
        `type must be one of: ${validImageTypes.join(', ')}`
      )
    );
  }

  try {
    const { imageId, type, url } = await storeUserPictureUrl({
      userId: existing.id,
      pictureUrl: sanitizedUrl,
      type: normalizedType,
    });

    const updated = userStore.update(existing.id, {
      pictureUrl: url,
      picture: {
        id: imageId,
        url,
        type,
      },
    });

    res.status(201).json({
      imageId,
      pictureUrl: url,
      type,
      user: updated,
    });
  } catch (error) {
    if (error.code === 'INVALID_PICTURE_ARGUMENT') {
      return next(HttpError.badRequest(error.message));
    }
    if (error.code === 'PICTURE_USER_NOT_FOUND') {
      return next(
        HttpError.notFound(
          `User with id ${req.params.id} was not found in the database`
        )
      );
    }
    if (error.code === 'DB_NOT_CONFIGURED') {
      return next(HttpError.internalServerError(error.message));
    }
    return next(
      HttpError.internalServerError('Could not store the picture URL')
    );
  }
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
