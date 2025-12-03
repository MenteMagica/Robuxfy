const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // follows an artist
    router.post("/", authenticateToken, async (req, res) => {
        const artistId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_artist (user_id, artist_id) 
                values (?, ?)
                on duplicate key update artist_id = artist_id
                `,
                [userId, artistId]
            );

            res.status(201).json({ message: "artist followed successfully." });
        } catch (error) {
            console.error("error following artist:", error);
            res.status(500).json({ error: "error processing follow." });
        }
    });

    return router;
};
