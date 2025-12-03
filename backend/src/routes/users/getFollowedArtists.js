const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // list artists followed by the user
    router.get("/", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [artists] = await db.query(
                `
                SELECT 
                    a.id, 
                    a.name, 
                    a.cover_image
                FROM 
                    user_artist ua
                JOIN 
                    artists a ON ua.artist_id = a.id
                WHERE 
                    ua.user_id = ?;
                `,
                [userId]
            );

            res.json({ total: artists.length, artists });
        } catch (error) {
            console.error("error fetching followed artists:", error);
            res.status(500).json({
                error: "error retrieving followed artists list.",
            });
        }
    });

    return router;
};
