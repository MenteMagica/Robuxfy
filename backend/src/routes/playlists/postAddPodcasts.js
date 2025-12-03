const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // add a podcast to playlist
    router.post(
        "/playlists/:id/podcasts",
        authenticateToken,
        async (req, res) => {
            const playlistId = req.params.id;
            const userId = req.user.id;
            const { podcast_id } = req.body;

            if (!podcast_id) {
                return res.status(400).json({ error: "Podcast ID required." });
            }

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

                // insert podcast
                await db.query(
                    `
                INSERT INTO podcast_playlist (podcast_id, playlist_id)
                VALUES (?, ?);
                `,
                    [podcast_id, playlistId]
                );

                res.status(201).json({ message: "Podcast added to playlist." });
            } catch (error) {
                // uniqueness constraint violation
                if (error.code === "ER_DUP_ENTRY") {
                    return res
                        .status(409)
                        .json({ error: "Podcast already in playlist." });
                }
                console.error("Error adding podcast to playlist:", error);
                res.status(500).json({ error: "Internal server error." });
            }
        }
    );

    return router;
};
