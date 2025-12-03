const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // list musics liked by the user
    router.get("/", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [musics] = await db.query(
                `
                SELECT 
                    m.id, 
                    m.title, 
                    a.name AS artist_name, 
                    m.cover_image
                FROM 
                    user_music um
                JOIN 
                    musics m ON um.music_id = m.id
                JOIN
                    artists a ON m.artist_id = a.id
                WHERE 
                    um.user_id = ? AND um.is_like = TRUE;
                `,
                [userId]
            );

            res.json({ total: musics.length, musics });
        } catch (error) {
            console.error("error fetching liked musics:", error);
            res.status(500).json({
                error: "error retrieving liked musics list.",
            });
        }
    });

    return router;
};
