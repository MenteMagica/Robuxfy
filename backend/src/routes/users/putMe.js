const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // update logged-in user profile data
    router.put("/me", authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { username, email, password } = req.body;

        if (!username && !email && !password) {
            return res.status(400).json({
                error: "at least one field (username, email, or password) must be provided for update.",
            });
        }

        try {
            let updateQuery = "update users set ";
            const updateValues = [];

            // handle username update
            if (username) {
                updateQuery += "username = ?, ";
                updateValues.push(username);
            }

            // handle email update
            if (email) {
                updateQuery += "email = ?, ";
                updateValues.push(email);
            }

            // handle password update (needs hashing)
            if (password) {
                const SALT_ROUNDS = 10;
                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                updateQuery += "password_hash = ?, ";
                updateValues.push(hashedPassword);
            }

            // remove trailing comma and space
            updateQuery = updateQuery.slice(0, -2);
            updateQuery += " where id = ?";
            updateValues.push(userId);

            // execute update
            await db.query(updateQuery, updateValues);

            res.json({ message: "user profile updated successfully." });
        } catch (error) {
            // handle unicity constraint violation for new email/username
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    error: "the new email or username is already in use.",
                });
            }
            console.error("error updating user profile:", error);
            res.status(500).json({
                error: "internal server error during profile update.",
            });
        }
    });

    return router;
};
