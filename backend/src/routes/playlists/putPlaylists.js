const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // update playlist metadata (owner only)
    router.put("/playlists/:id", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;
        const { name, cover_image_custom, is_public } = req.body;

        if (
            !name &&
            cover_image_custom === undefined &&
            is_public === undefined
        ) {
            return res.status(400).json({ error: "no fields for UPD." });
        }

        try {
            let updateQuery = "UPDATE playlists SET ";
            const updateValues = [];

            if (name) {
                updateQuery += "name = ?, ";
                updateValues.push(name);
            }
            if (cover_image_custom !== undefined) {
                updateQuery += "cover_image_custom = ?, ";
                updateValues.push(cover_image_custom);
            }
            if (is_public !== undefined) {
                updateQuery += "is_public = ?, ";
                updateValues.push(is_public);
            }

            updateQuery = updateQuery.slice(0, -2);
            updateQuery += " WHERE id = ? AND user_id = ?";
            updateValues.push(playlistId, userId);

            const [result] = await db.query(updateQuery, updateValues);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Playlist not found or unauthorized." });
            }

            res.json({ message: "Playlist update successful." });
        } catch (error) {
            console.error("Error update playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
