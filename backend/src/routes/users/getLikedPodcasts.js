const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // list podcasts liked by the user
    router.get("/", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [podcasts] = await db.query(
                `
                SELECT 
                    p.id, 
                    p.title, 
                    a.name AS artist_name, 
                    p.cover_image
                FROM 
                    user_podcast up
                JOIN 
                    podcasts p ON up.podcast_id = p.id
                JOIN
                    artists a ON p.artist_id = a.id
                WHERE 
                    up.user_id = ? AND up.is_like = TRUE;
                `,
                [userId]
            );

            res.json({ total: podcasts.length, podcasts });
        } catch (error) {
            console.error("error fetching liked podcasts:", error);
            res.status(500).json({
                error: "error retrieving liked podcasts list.",
            });
        }
    });

    return router;
};
