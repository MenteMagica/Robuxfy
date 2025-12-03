const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // lists the most recent released albums
    router.get("/", async (res) => {
        try {
            const [albums] = await db.query(
                `
                select 
                    a.id, 
                    a.name as title, 
                    a.release_date, 
                    ar.name as artist_name,
                    a.cover_image
                from 
                    albums a
                join 
                    artists ar on a.artist_id = ar.id
                where 
                    a.release_date <= curdate()
                order by 
                    a.release_date desc, a.id desc
                limit 
                    10;
                `
            );

            res.json({
                total: albums.length,
                albums: albums,
            });
        } catch (error) {
            console.error("error fetching recent albums:", error);
            res.status(500).json({
                error: "error retrieving recent album list.",
            });
        }
    });

    return router;
};
