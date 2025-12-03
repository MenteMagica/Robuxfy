const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // list of route modules and their corresponding URL prefixes
    const routes = [
        { file: "musicsId", prefix: "musics/:id" },
        { file: "podcastsId", prefix: "podcasts/:id" },
        { file: "albumsId", prefix: "albums/:id" },
        { file: "recentMusics", prefix: "recent/musics" },
        { file: "recentPodcasts", prefix: "recent/podcasts" },
        { file: "recentAlbums", prefix: "recent/albums" },
        { file: "searchMusics", prefix: "search/musics" },
        { file: "searchPodcasts", prefix: "search/podcasts" },
        { file: "searchAlbums", prefix: "search/albums" },
        { file: "searchArtists", prefix: "search/artists" },
    ];

    // dynamically import and mount each router
    routes.map(({ file, prefix }) => {
        // require the module and pass dependencies
        const routeRouter = require(`./${file}`)(db);
        // mount the router on its URL prefix
        router.use(`/${prefix}`, routeRouter);
    });

    return router;
};
