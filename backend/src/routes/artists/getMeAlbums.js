const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();
    // get the artist's albums sorted in descending order by release date.
    router.get("/me/albums", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        try {
            const [albums] = await db.query(
                "SELECT id, title, release_date, cover_image FROM albums WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );
            res.json({ total: albums.length, albums: albums });
        } catch (error) {
            console.error("Error fetching artist albums:", error);
            res.status(500).json({ error: "Error retrieving artist albums." });
        }
    });
    return router;
};
