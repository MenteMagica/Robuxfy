const jwt = require("jsonwebtoken");

module.exports = (JWT_SECRET) => {
    return (req, res, next) => {
        const auth_header = req.headers["authorization"];
        // authorization header validation
        if (!auth_header) {
            return res
                .status(401)
                .json({ error: "Authorization header missing." });
        }

        const [scheme, token] = auth_header.split(" ");
        // token header validation
        if (scheme.toLowerCase() !== "bearer" || !token) {
            return res.status(401).json({ error: "Malformed token." });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // checks if the payload holds the user id
            if (!decoded.id) {
                return res
                    .status(401)
                    .json({ error: "Invalid token payload." });
            }

            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ error: "Invalid or expired token." });
        }
    };
};
