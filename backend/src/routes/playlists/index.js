const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // list of route modules and their corresponding URL prefixes
    const routes = [
        { file: "deletePlaylists", prefix: "playlists/:id" },
        { file: "deleteRmvMusics", prefix: "playlists/:id/musics/:musicId" },
        {
            file: "deleteRmvPodcasts",
            prefix: "playlists/:id/podcasts/:podcastId",
        },
        { file: "getPlaylists", prefix: "playlists/:id" },
        { file: "postAddMusics", prefix: "playlists/:id/musics" },
        { file: "postAddPodcasts", prefix: "playlists/:id/podcasts" },
        { file: "postPlaylists.js", prefix: "playlists" },
        { file: "putPlaylists", prefix: "playlists" },
    ];

    // dynamically import and mount each router
    routes.map(({ file, prefix }) => {
        // require the module and pass dependencies
        const routeRouter = require(`./${file}`)(db, authenticateToken);
        // mount the router on its URL prefix
        router.use(`/${prefix}`, routeRouter);
    });

    return router;
};
