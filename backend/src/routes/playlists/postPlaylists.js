const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    //  create a new playlist
    router.post("/playlists", authenticateToken, async (req, res) => {
        const userId = req.user.id;
        const { name, cover_image_custom, is_public } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Playlist name required." });
        }

        try {
            const [result] = await db.query(
                `
                INSERT INTO playlists (user_id, name, cover_image_custom, is_public)
                VALUES (?, ?, ?, ?);
                `,
                [userId, name, cover_image_custom || null, is_public || true]
            );

            res.status(201).json({
                message: "Playlist created.",
                playlistId: result.insertId,
            });
        } catch (error) {
            console.error("Error creating playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
