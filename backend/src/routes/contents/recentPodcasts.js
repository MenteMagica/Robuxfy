const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // lists the most recent released podcasts
    router.get("/recent/podcasts", async (req, res) => {
        try {
            const [podcasts] = await db.query(
                `
                select 
                    p.id, 
                    p.title, 
                    p.release_date, 
                    a.name as artist_name,
                    p.cover_image
                from 
                    podcasts p
                join 
                    artists a on p.artist_id = a.id
                where 
                    p.release_date <= curdate()
                order by 
                    p.release_date desc, p.id desc
                limit 
                    50;
                `
            );

            res.json({
                total: podcasts.length,
                podcasts: podcasts,
            });
        } catch (error) {
            console.error("error fetching recent podcasts:", error);
            res.status(500).json({
                error: "error retrieving recent podcast list.",
            });
        }
    });

    return router;
};
