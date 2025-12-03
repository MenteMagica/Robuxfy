const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // fetches album details, its tracks, and consolidated genres
    router.get("/", async (req, res) => {
        const albumId = req.params.id;

        try {
            // select main album details and artist
            const [albumDetails] = await db.query(
                `
                select 
                    a.id, 
                    a.name as title, 
                    a.release_date, 
                    a.description,
                    a.cover_image,
                    ar.id as artist_id,
                    ar.name as artist_name
                from 
                    albums a
                join
                    artists ar on a.artist_id = ar.id
                where 
                    a.id = ? 
                and 
                    a.release_date <= curdate()
                `,
                [albumId]
            );

            if (albumDetails.length === 0) {
                return res
                    .status(404)
                    .json({ error: "album not found or not yet released." });
            }

            const album = albumDetails[0];

            // fetch album tracks
            const [tracks] = await db.query(
                `
                select 
                    id, title, url, release_date, description
                from 
                    musics 
                where 
                    album_id = ?
                order by 
                    id asc
                `,
                [albumId]
            );

            // fetch genres
            const [genres] = await db.query(
                `
                select distinct 
                    g.id as genre_id,
                    g.name as genre_name
                from 
                    musics m 
                join 
                    music_genre mg on m.id = mg.music_id
                join 
                    genres g on mg.genre_id = g.id
                where 
                    m.album_id = ?
                `,
                [albumId]
            );

            res.json({
                ...album,
                tracks: tracks,
                genres: genres,
            });
        } catch (error) {
            console.error("error fetching album details:", error);
            res.status(500).json({ error: "error retrieving content." });
        }
    });

    return router;
};
