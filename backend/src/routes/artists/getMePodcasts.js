const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    // get the artist's podcasts sorted in descending order by release date.
    router.get("/", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId; // get user/artist id
        try {
            const [podcasts] = await db.query(
                "SELECT id, title, release_date, url FROM podcasts WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );
            res.json({ total: podcasts.length, podcasts: podcasts });
        } catch (error) {
            console.error("Error fetching artist podcasts:", error);
            res.status(500).json({
                error: "Error retrieving artist podcasts.",
            });
        }
    });

    return router;
};
