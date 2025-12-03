const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    // Deletes the artist registration (reverts the user to a standard user)
    router.delete("/me", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId; // get user/artist id

        try {
            const deleteQuery = "DELETE FROM artists WHERE id = ?";
            const [result] = await db.query(deleteQuery, [artistId]);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Artist profile not found." });
            }

            res.status(200).json({
                message:
                    "Artist profile deleted successfully. User remains active.",
            });
        } catch (error) {
            console.error("Artist deletion error:", error);
            res.status(500).json({ error: "Error deleting artist profile." });
        }
    });

    return router;
};
