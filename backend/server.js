const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// minio services
const { upload_media } = require("./src/middlewares/parseMultipartForm");

// security modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET =
    process.env.JWT_SECRET || "my_super_secret_and_unsolvable_key";

// load database modules
const db = require("./src/database/database-sql");

// middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors());

// improved logging middleware
app.use((req, res, next) => {
    const start = process.hrtime();

    next();

    // log after response is finished
    res.on("finish", () => {
        const elapsed = process.hrtime(start);
        const durationMs = elapsed[0] * 1000 + elapsed[1] / 1e6;

        const logMessage =
            `[${new Date().toISOString()}] ` +
            `IP: ${req.ip || "N/A"} - ` +
            `STATUS: ${res.statusCode} - ` +
            `TIME: ${durationMs.toFixed(3)}ms - ` +
            `${req.method} ${req.originalUrl}`;

        console.log(logMessage);
    });
});

// load route modules with dependency injection
const authenticateTokenFactory = require("./src/middlewares/authToken");
const authMiddleware = authenticateTokenFactory(JWT_SECRET);
const dbPool = db;

// auth
const authRoutes = require("./src/routes/auths")(
    dbPool,
    bcrypt,
    jwt,
    JWT_SECRET,
    upload_media
);
app.use("/auth", authRoutes);

// contents
const contentRoutes = require("./src/routes/contents")(dbPool, authMiddleware);
app.use("/content", contentRoutes);

// artists
const artistRoutes = require("./src/routes/artists")(dbPool, authMiddleware);
app.use("/artist", artistRoutes);

// playlists
const playlistRoutes = require("./src/routes/playlists")(
    dbPool,
    authMiddleware
);
app.use("/playlist", playlistRoutes);

// interaction
const interactRoutes = require("./src/routes/interactions")(
    dbPool,
    authMiddleware
);
app.use("/interact", interactRoutes);

// users
const userRoutes = require("./src/routes/users")(dbPool, authMiddleware);
app.use("/user", userRoutes);

// initialize the server
app.listen(PORT, () => {
    console.log(`\nServer running on port ${PORT}`);
    console.log(`Access: http://localhost:${PORT}`);
});
