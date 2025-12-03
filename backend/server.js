const express = require("express");
const cors = require("cors");
require("dotenv").config();

// security modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// load database modules
const dbPool = require("./src/database/databaseSQL");

// load route modules with dependency injection
const { auth, isArtist, logger } = require("./src/middlewares/index");
const authMiddleware = auth(JWT_SECRET);
const isArtistMiddleware = isArtist(db);
const loggerMiddleware = logger();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(loggerMiddleware);

// auth
const authRoutes = require("./src/routes/auth/index")(
    dbPool,
    bcrypt,
    jwt,
    JWT_SECRET
);
app.use("/auth", authRoutes);

// contents
const contentRoutes = require("./src/routes/contents/index")(dbPool);
app.use("/content", contentRoutes);

// interaction
const interactRoutes = require("./src/routes/interactions/index")(
    dbPool,
    authMiddleware
);
app.use("/interact", interactRoutes);

// artists
const artistRoutes = require("./src/routes/artists/index")(
    dbPool,
    authMiddleware,
    isArtistMiddleware
);
app.use("/artist", artistRoutes);

// playlists
const playlistRoutes = require("./src/routes/playlists/index")(
    dbPool,
    authMiddleware
);
app.use("/playlist", playlistRoutes);

// users
const userRoutes = require("./src/routes/users/index")(dbPool, authMiddleware);
app.use("/user", userRoutes);

// initialize the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
