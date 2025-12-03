const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // remove a music from playlist
    router.delete(
        "/playlists/:id/musics/:musicId",
        authenticateToken,
        async (req, res) => {
            const playlistId = req.params.id;
            const musicId = req.params.musicId;
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

                // remove song
                const [result] = await db.query(
                    `
                DELETE FROM music_playlist 
                WHERE playlist_id = ? AND music_id = ?;
                `,
                    [playlistId, musicId]
                );

                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Music not found in playlist." });
                }

                res.json({ message: "Music removed from playlist." });
            } catch (error) {
                console.error("Error removing music from playlist:", error);
                res.status(500).json({ error: "Internal server error." });
            }
        }
    );

    return router;
};
