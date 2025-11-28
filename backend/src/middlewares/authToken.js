const jwt = require("jsonwebtoken");

module.exports = (JWT_SECRET) => {
    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (token == null) {
            return res
                .status(401)
                .json({ error: "Access token not provided." });
        }

        // verify token
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res
                    .status(403)
                    .json({ error: "Invalid or expired token." });
            }
            req.user = user;

            // continue to the next function in the route
            next();
        });
    };

    return authenticateToken;
};
