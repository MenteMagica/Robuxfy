const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // remove a podcast from playlist
    router.delete(
        "/playlists/:id/podcasts/:podcastId",
        authenticateToken,
        async (req, res) => {
            const playlistId = req.params.id;
            const podcastId = req.params.podcastId;
            const userId = req.user.id;

            try {
                // check playlist ownership
                const [owner] = await db.query(
                    "SELECT user_id FROM playlists WHERE id = ? AND user_id = ?",
                    [playlistId, userId]
                );

                if (owner.length === 0) {
                    return res
                        .status(403)
                        .json({ error: "Unauthorized to modify playlist." });
                }

                // remove podcast
                const [result] = await db.query(
                    `
                DELETE FROM podcast_playlist 
                WHERE playlist_id = ? AND podcast_id = ?;
                `,
                    [playlistId, podcastId]
                );

                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Podcast not found in playlist." });
                }

                res.json({ message: "Podcast removed from playlist." });
            } catch (error) {
                console.error("Error removing podcast from playlist:", error);
                res.status(500).json({ error: "Internal server error." });
            }
        }
    );

    return router;
};
