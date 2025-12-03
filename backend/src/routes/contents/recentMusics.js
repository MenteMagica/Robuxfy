const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // lists the most recent released music
    router.get("/recent/musics", async (res) => {
        try {
            const [musics] = await db.query(
                `
                select 
                    m.id, 
                    m.title, 
                    m.release_date, 
                    a.name as artist_name,
                    m.cover_image
                from 
                    musics m
                join 
                    artists a on m.artist_id = a.id
                where 
                    m.release_date <= curdate()
                order by 
                    m.release_date desc, m.id desc
                limit 
                    50;
                `
            );

            res.json({
                total: musics.length,
                musics: musics,
            });
        } catch (error) {
            console.error("error fetching recent musics:", error);
            res.status(500).json({
                error: "error retrieving recent music list.",
            });
        }
    });

    return router;
};
