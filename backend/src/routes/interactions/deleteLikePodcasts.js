const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // sets is_like to false (deslike podcast)
    router.delete("/podcasts/:id/like", authenticateToken, async (req, res) => {
        const podcastId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `
                update user_podcast 
                set is_like = false
                where user_id = ? and podcast_id = ?
                `,
                [userId, podcastId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "user/podcast record not found or like already inactive.",
                });
            }

            res.json({ message: "podcast unliked successfully." });
        } catch (error) {
            console.error("error unliking podcast:", error);
            res.status(500).json({ error: "error processing unlike." });
        }
    });

    return router;
};
