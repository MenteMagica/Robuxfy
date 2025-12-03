const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // sets is_like to true (like music)
    router.post("/musics/:id/like", authenticateToken, async (req, res) => {
        const musicId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_music (user_id, music_id, is_like) 
                values (?, ?, true)
                on duplicate key update is_like = true
                `,
                [userId, musicId]
            );

            res.status(201).json({ message: "music liked successfully." });
        } catch (error) {
            console.error("error liking music:", error);
            res.status(500).json({ error: "error processing like." });
        }
    });

    return router;
};
