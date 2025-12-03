const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // unfollows an artist
    router.delete(
        "/artists/:id/follow",
        authenticateToken,
        async (req, res) => {
            const artistId = req.params.id;
            const userId = req.user.id;

            try {
                const [result] = await db.query(
                    `
                delete from user_artist 
                where user_id = ? and artist_id = ?
                `,
                    [userId, artistId]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "follow not found for this user and artist.",
                    });
                }

                res.json({ message: "artist unfollowed successfully." });
            } catch (error) {
                console.error("error unfollowing artist:", error);
                res.status(500).json({ error: "error processing unfollow." });
            }
        }
    );

    return router;
};
