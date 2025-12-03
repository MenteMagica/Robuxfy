const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // fetches details of a single music track
    router.get("/musics/:id", async (req, res) => {
        const musicId = req.params.id;

        try {
            // select music and artist details
            const [musicDetails] = await db.query(
                `
                select 
                    m.id, 
                    m.title, 
                    m.release_date, 
                    m.url, 
                    m.description,
                    m.cover_image,
                    m.album_id,
                    a.id as artist_id,
                    a.name as artist_name
                from 
                    musics m
                join
                    artists a on m.artist_id = a.id
                where 
                    m.id = ? 
                and 
                    m.release_date <= curdate()
                `,
                [musicId]
            );

            if (musicDetails.length === 0) {
                return res
                    .status(404)
                    .json({ error: "music not found or not yet released." });
            }

            const music = musicDetails[0];

            // fetch genres
            const [genres] = await db.query(
                `
                select 
                    g.id, g.name 
                from 
                    music_genre mg
                join 
                    genres g on mg.genre_id = g.id
                where 
                    mg.music_id = ?
                `,
                [musicId]
            );

            // fetch collaborators
            const [collaborators] = await db.query(
                `
                select 
                    a.id, a.name 
                from 
                    artist_music am
                join 
                    artists a on am.artist_id = a.id
                where 
                    am.music_id = ?
                `,
                [musicId]
            );

            res.json({
                ...music,
                genres: genres,
                collaborators: collaborators,
            });
        } catch (error) {
            console.error("error fetching music details:", error);
            res.status(500).json({ error: "error retrieving content." });
        }
    });

    return router;
};
