const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();

    // list of route modules and their corresponding URL prefixes
    const routes = [
        { file: "postRegister", prefix: "register" },
        { file: "putBanner", prefix: "banner" },
        { file: "postContent", prefix: "content" },
        { file: "getMeMusics", prefix: "me/musics" },
        { file: "getMePodcasts", prefix: "me/podcasts" },
        { file: "getMeAlbums", prefix: "me/albums" },
        { file: "deleteMe", prefix: "me" },
    ];

    // dynamically import and mount each router
    routes.map(({ file, prefix }) => {
        // require the module and pass dependencies (db, authMiddleware, isArtist)
        const routeRouter = require(`./${file}`)(db, authMiddleware, isArtist);
        // mount the router on its URL prefix
        router.use(`/${prefix}`, routeRouter);
    });

    return router;
};
