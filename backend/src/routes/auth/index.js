const express = require("express");

module.exports = (db, bcrypt, jwt, JWT_SECRET) => {
    const router = express.Router();
    // require modules and its dependencies
    const registerRouter = require("./postRegister")(db, bcrypt);
    const loginRouter = require("./postLogin")(db, bcrypt, jwt, JWT_SECRET);
    // mount routers directly (paths are defined inside each module)
    router.use(registerRouter);
    router.use(loginRouter);

    return router;
};
