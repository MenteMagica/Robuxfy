const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // delete playlist (owner only)
    router.delete("/", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `DELETE FROM playlists WHERE id = ? AND user_id = ?;`,
                [playlistId, userId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Playlist not found or unauthorized." });
            }

            res.json({ message: "Playlist deletion completed successfully." });
        } catch (error) {
            console.error("Error deleting playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
