const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // add a music to playlist
    router.post("/", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;
        const { music_id } = req.body;

        if (!music_id) {
            return res.status(400).json({ error: "music ID required." });
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

            // insert music
            await db.query(
                `
                INSERT INTO music_playlist (music_id, playlist_id)
                VALUES (?, ?);
                `,
                [music_id, playlistId]
            );

            res.status(201).json({ message: "Music added to playlist." });
        } catch (error) {
            // uniqueness constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                return res
                    .status(409)
                    .json({ error: "Music already in playlist." });
            }
            console.error("Error adding music to playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
