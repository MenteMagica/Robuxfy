const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    // Get the artist's musics sorted in descending order by release date.
    router.get("/me/musics", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId; // get user/artist id

        try {
            const [musics] = await db.query(
                "SELECT id, title, release_date, url FROM musics WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );

            res.json({
                total: musics.length,
                musics: musics,
            });
        } catch (error) {
            console.error("Error fetching artist posts:", error);
            res.status(500).json({ error: "Error retrieving artist posts." });
        }
    });
    return router;
};
