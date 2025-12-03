const express = require("express");

module.exports = (db, bcrypt, jwt, JWT_SECRET) => {
    const router = express.Router();
    // require modules and its dependencies
    const { registerRouter } = require("./postRegister")(db, bcrypt);
    const { loginRouter } = require("./postLogin")(db, bcrypt, jwt, JWT_SECRET);
    // mount the router on its URL prefix
    router.use("/register", registerRouter);
    router.use("/login", loginRouter);

    return router;
};
