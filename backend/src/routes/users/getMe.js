const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // fetch logged-in user profile data
    router.get("/me", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [users] = await db.query(
                `
                select 
                    id, 
                    username, 
                    email, 
                    date_of_birth,
                    created_at 
                from 
                    users 
                where 
                    id = ?
                `,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: "user not found." });
            }

            res.json({ user: users[0] });
        } catch (error) {
            console.error("error fetching user profile:", error);
            res.status(500).json({ error: "internal server error." });
        }
    });

    return router;
};
