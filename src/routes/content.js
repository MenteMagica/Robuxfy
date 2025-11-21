import { Router } from 'express';
import {
  artistStore,
  interactionStore,
  postStore,
  userStore,
} from '../data/store.js';
import HttpError from '../errors/http-error.js';
import { normalize, requireFields } from '../utils/validation.js';

const contentRouter = Router();
const allowedInteractionTypes = new Set(['like', 'comment', 'view']);

const buildPostWithMetrics = (post) => {
  const artist = artistStore.getById(post.artistId);
  const interactions = interactionStore.find(
    (interaction) => interaction.postId === post.id
  );
  const likes = interactions.filter((interaction) => interaction.type === 'like')
    .length;
  const comments = interactions.filter(
    (interaction) => interaction.type === 'comment'
  ).length;
  const views = interactions.filter((interaction) => interaction.type === 'view')
    .length;
  return {
    ...post,
    artist: artist ?? null,
    metrics: {
      likes,
      comments,
      views,
      totalInteractions: interactions.length,
    },
  };
};

contentRouter.get('/', (req, res) => {
  const { artistId, search, visibility } = req.query;
  let posts = postStore.getAll();

  if (artistId) {
    posts = posts.filter((post) => post.artistId === artistId);
  }

  if (visibility) {
    const normalizedVisibility = normalize(visibility);
    posts = posts.filter(
      (post) => normalize(post.visibility ?? 'public') === normalizedVisibility
    );
  }

  if (search) {
    const needle = normalize(search);
    posts = posts.filter(
      (post) =>
        normalize(post.title).includes(needle) ||
        normalize(post.body ?? '').includes(needle)
    );
  }

  res.json(posts.map((post) => buildPostWithMetrics(post)));
});

contentRouter.get('/:id', (req, res, next) => {
  const post = postStore.getById(req.params.id);
  if (!post) {
    return next(
      HttpError.notFound(`Content with id ${req.params.id} does not exist`)
    );
  }

  res.json(buildPostWithMetrics(post));
});

contentRouter.get('/:id/interactions', (req, res, next) => {
  const post = postStore.getById(req.params.id);
  if (!post) {
    return next(
      HttpError.notFound(`Content with id ${req.params.id} does not exist`)
    );
  }

  res.json(
    interactionStore.find((interaction) => interaction.postId === post.id)
  );
});

contentRouter.post('/', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['artistId', 'title', 'body']);
  if (missing) {
    return next(
      HttpError.badRequest(`Missing required fields: ${missing.join(', ')}`)
    );
  }

  const artist = artistStore.getById(payload.artistId.trim());
  if (!artist) {
    return next(HttpError.notFound('artistId does not match any artist'));
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

contentRouter.post('/:id/interactions', (req, res, next) => {
  const payload = req.body ?? {};
  const missing = requireFields(payload, ['userId', 'type']);
  if (missing) {
    return next(
      HttpError.badRequest(`Missing required fields: ${missing.join(', ')}`)
    );
  }

  const post = postStore.getById(req.params.id);
  if (!post) {
    return next(
      HttpError.notFound(`Content with id ${req.params.id} does not exist`)
    );
  }

  const user = userStore.getById(payload.userId.trim());
  if (!user) {
    return next(HttpError.notFound('userId does not match any user'));
  }

  const normalizedType = normalize(payload.type);
  if (!allowedInteractionTypes.has(normalizedType)) {
    return next(
      HttpError.badRequest(
        `type must be one of: ${Array.from(allowedInteractionTypes).join(', ')}`
      )
    );
  }

  if (normalizedType === 'comment') {
    if (typeof payload.message !== 'string' || payload.message.trim() === '') {
      return next(
        HttpError.badRequest('message must be provided for comment interactions')
      );
    }
  }

  const createdInteraction = interactionStore.create({
    postId: post.id,
    userId: user.id,
    type: normalizedType,
    message:
      normalizedType === 'comment' && payload.message
        ? payload.message.trim()
        : null,
  });

  res.status(201).json(createdInteraction);
});

export default contentRouter;
