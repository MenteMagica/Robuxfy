module.exports = (db, bcrypt, jwt, JWT_SECRET) => {
    const express = require("express");
    const router = express.Router();

    // logs-in the user
    router.post("/", async (req, res) => {
        const { email, password } = req.body;

        try {
            const [users] = await db.query(
                "SELECT id, username, email, password_hash FROM users WHERE email = ?",
                [email]
            );
            const user = users[0];
            // user not found
            if (!user) {
                return res
                    .status(401)
                    .json({ error: "Invalid email or password" });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash);
            // poassword validation
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ error: "Invalid email or password" });
            }
            // create user token valid for 7 days
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "Login successful!",
                token: token,
                userId: user.id,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
