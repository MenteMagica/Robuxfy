import { Router } from 'express';
import {
  artistStore,
  interactionStore,
  postStore,
  userStore,
} from '../data/store.js';

const adminRouter = Router();

adminRouter.get('/dashboard', (req, res) => {
  const users = userStore.getAll();
  const artists = artistStore.getAll();
  const posts = postStore.getAll();
  const interactions = interactionStore.getAll();

  const interactionsByType = interactions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] ?? 0) + 1;
    return acc;
  }, {});

  const postsByArtist = artists.map((artist) => {
    const artistPosts = posts.filter((post) => post.artistId === artist.id);
    const artistInteractions = interactions.filter((interaction) =>
      artistPosts.some((post) => post.id === interaction.postId)
    );
    return {
      artist,
      postCount: artistPosts.length,
      interactionCount: artistInteractions.length,
    };
  });

  res.json({
    totals: {
      users: users.length,
      artists: artists.length,
      posts: posts.length,
      interactions: interactions.length,
    },
    interactionsByType,
    postsByArtist,
  });
});

export default adminRouter;
