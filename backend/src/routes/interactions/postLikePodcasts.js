const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // sets is_like to true (like podcast)
    router.post("/", authenticateToken, async (req, res) => {
        const podcastId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_podcast (user_id, podcast_id, is_like) 
                values (?, ?, true)
                on duplicate key update is_like = true
                `,
                [userId, podcastId]
            );

            res.status(201).json({ message: "podcast liked successfully." });
        } catch (error) {
            console.error("error liking podcast:", error);
            res.status(500).json({ error: "error processing like." });
        }
    });

    return router;
};
