const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // fetches details of a single podcast
    router.get("/", async (req, res) => {
        const podcastId = req.params.id;

        try {
            // select main podcast details and artist
            const [podcastDetails] = await db.query(
                `
                select 
                    p.id, 
                    p.title, 
                    p.release_date, 
                    p.url, 
                    p.description,
                    p.cover_image,
                    a.id as artist_id,
                    a.name as artist_name
                from 
                    podcasts p
                join
                    artists a on p.artist_id = a.id
                where 
                    p.id = ? 
                and 
                    p.release_date <= curdate()
                `,
                [podcastId]
            );

            if (podcastDetails.length === 0) {
                return res
                    .status(404)
                    .json({ error: "podcast not found or not yet released." });
            }

            const podcast = podcastDetails[0];

            // fetch genres
            const [genres] = await db.query(
                `
                select 
                    g.id, g.name 
                from 
                    podcast_genre pg
                join 
                    genres g on pg.genre_id = g.id
                where 
                    pg.podcast_id = ?
                `,
                [podcastId]
            );

            // compose final response
            res.json({
                ...podcast,
                genres: genres,
            });
        } catch (error) {
            console.error("error fetching podcast details:", error);
            res.status(500).json({ error: "error retrieving content." });
        }
    });

    return router;
};
