module.exports = (db) => {
    const express = require("express");
    const router = express.Router();

    // searches for music by name
    router.get("/search/musics", async (req, res) => {
        const searchTerm = req.query.q;

        if (!searchTerm || searchTerm.length < 3) {
            return res.status(400).json({
                error: "search term (q) must be at least 3 characters long.",
            });
        }

        try {
            const [results] = await db.query(
                `
                select 
                    m.id, 
                    m.title, 
                    m.release_date, 
                    a.name as artist_name
                from 
                    musics m
                join
                    artists a on m.artist_id = a.id
                where 
                    m.title like concat('%', ?, '%')
                and 
                    m.release_date <= curdate()
                order by 
                    m.title asc
                limit 
                    10;
                `,
                [searchTerm]
            );

            res.json({
                total: results.length,
                musics: results,
            });
        } catch (error) {
            console.error("error executing music search:", error);
            res.status(500).json({ error: "error retrieving search results." });
        }
    });

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

    // fetches album details, its tracks, and consolidated genres
    router.get("/albums/:id", async (req, res) => {
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

    // fetches details of a single podcast
    router.get("/podcasts/:id", async (req, res) => {
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

    // lists the most recent released albums
    router.get("/recent/albums", async (res) => {
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

    // lists the most recent released podcasts
    router.get("/recent/podcasts", async (res) => {
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
