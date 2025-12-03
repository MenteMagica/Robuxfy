const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // list of route modules and their corresponding URL prefixes
    const routes = [
        { file: "deleteFollowArtists", prefix: "artists/:id/follow" },
        { file: "deleteLikeMusics", prefix: "musics/:id/like" },
        { file: "deleteLikePodcasts", prefix: "podcasts/:id/like" },
        { file: "deleteRejectFriend", prefix: "users/:username/unfriend" },
        { file: "postAcceptFriend", prefix: "users/:username/accept" },
        { file: "postFollowArtists", prefix: "artists/:id/follow" },
        { file: "postLikeMusics", prefix: "musics/:id/like" },
        { file: "postLikePodcasts", prefix: "podcasts/:id/like" },
        { file: "postRequestFriend", prefix: "users/:username/request" },
    ];

    // dynamically import and mount each router
    routes.map(({ file }) => {
        // require the module and pass dependencies
        const routeRouter = require(`./${file}`)(db, authenticateToken);
        // mount the router directly (paths are declared inside each module)
        router.use(routeRouter);
    });

    return router;
};
