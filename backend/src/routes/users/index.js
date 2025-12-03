const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // list of route modules and their corresponding URL prefixes
    const routes = [
        { file: "getFollowedArtists", prefix: "me/artists/follows" },
        { file: "getFriends", prefix: "me/friends" },
        { file: "getLikedMusics", prefix: "me/musics/likes" },
        { file: "getLikedPodcasts", prefix: "me/podcasts/likes" },
        { file: "getMe", prefix: "me" },
        { file: "putMe", prefix: "me" },
        { file: "putProfilePicture", prefix: "profile-picture" },
    ];

    // dynamically import and mount each router
    routes.map(({ file }) => {
        // require the module and pass dependencies
        const routeRouter = require(`./${file}`)(db, authMiddleware);
        // mount the router directly (paths are declared inside each module)
        router.use(routeRouter);
    });

    return router;
};
