const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // sets is_like to false (deslike music)
    router.delete("/musics/:id/like", authenticateToken, async (req, res) => {
        const musicId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `
                update user_music 
                set is_like = false
                where user_id = ? and music_id = ?
                `,
                [userId, musicId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "user/music record not found." });
            }

            res.json({ message: "music unliked successfully." });
        } catch (error) {
            console.error("error unliking music:", error);
            res.status(500).json({ error: "error processing unlike." });
        }
    });

    return router;
};
