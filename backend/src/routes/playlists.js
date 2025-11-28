module.exports = (db, authenticateToken) => {
    const express = require("express");
    const router = express.Router();

    //  create a new playlist
    router.post("/", authenticateToken, async (req, res) => {
        const userId = req.user.id;
        const { name, cover_image_custom, is_public } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Playlist name required." });
        }

        try {
            const [result] = await db.query(
                `
                INSERT INTO playlists (user_id, name, cover_image_custom, is_public)
                VALUES (?, ?, ?, ?);
                `,
                [userId, name, cover_image_custom || null, is_public || true]
            );

            res.status(201).json({
                message: "Playlist created.",
                playlistId: result.insertId,
            });
        } catch (error) {
            console.error("Error creating playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // view playlist content
    router.get("/:id", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;

        try {
            // fetch playlist metadata and check access
            const [playlists] = await db.query(
                `
                SELECT 
                    p.id, p.name, p.is_public, p.cover_image_custom, 
                    u.username AS creator_username
                FROM 
                    playlists p
                JOIN 
                    users u ON p.user_id = u.id
                WHERE 
                    p.id = ? 
                    AND (p.is_public = TRUE OR p.user_id = ?); 
                `,
                [playlistId, userId]
            );

            if (playlists.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Playlist not found or access denied." });
            }

            // fetch musics
            const [musics] = await db.query(
                `
                SELECT 
                    m.id, m.title, a.name AS artist_name
                FROM 
                    music_playlist mp
                JOIN 
                    musics m ON mp.music_id = m.id
                JOIN
                    artists a ON m.artist_id = a.id
                WHERE 
                    mp.playlist_id = ?;
                `,
                [playlistId]
            );

            // fetch podcasts
            const [podcasts] = await db.query(
                `
                SELECT 
                    p.id, p.title, a.name AS artist_name
                FROM 
                    podcast_playlist pp
                JOIN 
                    podcasts p ON pp.podcast_id = p.id
                JOIN
                    artists a ON p.artist_id = a.id
                WHERE 
                    pp.playlist_id = ?;
                `,
                [playlistId]
            );

            const playlist = playlists[0];
            playlist.musics = musics;
            playlist.podcasts = podcasts;

            res.json({ playlist });
        } catch (error) {
            console.error("Error fetching playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // update playlist metadata (owner only)
    router.put("/:id", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;
        const { name, cover_image_custom, is_public } = req.body;

        if (
            !name &&
            cover_image_custom === undefined &&
            is_public === undefined
        ) {
            return res.status(400).json({ error: "no fields for UPD." });
        }

        try {
            let updateQuery = "UPDATE playlists SET ";
            const updateValues = [];

            if (name) {
                updateQuery += "name = ?, ";
                updateValues.push(name);
            }
            if (cover_image_custom !== undefined) {
                updateQuery += "cover_image_custom = ?, ";
                updateValues.push(cover_image_custom);
            }
            if (is_public !== undefined) {
                updateQuery += "is_public = ?, ";
                updateValues.push(is_public);
            }

            updateQuery = updateQuery.slice(0, -2);
            updateQuery += " WHERE id = ? AND user_id = ?";
            updateValues.push(playlistId, userId);

            const [result] = await db.query(updateQuery, updateValues);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Playlist not found or unauthorized." });
            }

            res.json({ message: "Playlist update successful." });
        } catch (error) {
            console.error("Error update playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // delete playlist (owner only)
    router.delete("/:id", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `DELETE FROM playlists WHERE id = ? AND user_id = ?;`,
                [playlistId, userId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Playlist not found or unauthorized." });
            }

            res.json({ message: "Playlist deletion completed successfully." });
        } catch (error) {
            console.error("Error deleting playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // playlist music management
    // add a song to playlist
    router.post("/:id/musics", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;
        const { music_id } = req.body;

        if (!music_id) {
            return res.status(400).json({ error: "music ID required." });
        }

        try {
            // check playlist ownership
            const [owner] = await db.query(
                "SELECT user_id FROM playlists WHERE id = ? AND user_id = ?",
                [playlistId, userId]
            );

            if (owner.length === 0) {
                return res
                    .status(403)
                    .json({ error: "Unauthorized to modify playlist." });
            }

            // insert music
            await db.query(
                `
                INSERT INTO music_playlist (music_id, playlist_id)
                VALUES (?, ?);
                `,
                [music_id, playlistId]
            );

            res.status(201).json({ message: "Music added to playlist." });
        } catch (error) {
            // uniqueness constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                return res
                    .status(409)
                    .json({ error: "Music already in playlist." });
            }
            console.error("Error adding music to playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // remove a song from playlist
    router.delete(
        "/:id/musics/:musicId",
        authenticateToken,
        async (req, res) => {
            const playlistId = req.params.id;
            const musicId = req.params.musicId;
            const userId = req.user.id;

            try {
                // check playlist ownership
                const [owner] = await db.query(
                    "SELECT user_id FROM playlists WHERE id = ? AND user_id = ?",
                    [playlistId, userId]
                );

                if (owner.length === 0) {
                    return res
                        .status(403)
                        .json({ error: "Unauthorized to modify playlist." });
                }

                // remove song
                const [result] = await db.query(
                    `
                DELETE FROM music_playlist 
                WHERE playlist_id = ? AND music_id = ?;
                `,
                    [playlistId, musicId]
                );

                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Music not found in playlist." });
                }

                res.json({ message: "Music removed from playlist." });
            } catch (error) {
                console.error("Error removing music from playlist:", error);
                res.status(500).json({ error: "Internal server error." });
            }
        }
    );

    // playlist podcast management
    // add a podcast to playlist
    router.post("/:id/podcasts", authenticateToken, async (req, res) => {
        const playlistId = req.params.id;
        const userId = req.user.id;
        const { podcast_id } = req.body;

        if (!podcast_id) {
            return res.status(400).json({ error: "Podcast ID required." });
        }

        try {
            // check playlist ownership
            const [owner] = await db.query(
                "SELECT user_id FROM playlists WHERE id = ? AND user_id = ?",
                [playlistId, userId]
            );

            if (owner.length === 0) {
                return res
                    .status(403)
                    .json({ error: "Unauthorized to modify playlist." });
            }

            // insert podcast
            await db.query(
                `
                INSERT INTO podcast_playlist (podcast_id, playlist_id)
                VALUES (?, ?);
                `,
                [podcast_id, playlistId]
            );

            res.status(201).json({ message: "Podcast added to playlist." });
        } catch (error) {
            // uniqueness constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                return res
                    .status(409)
                    .json({ error: "Podcast already in playlist." });
            }
            console.error("Error adding podcast to playlist:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    // remove a podcast from playlist
    router.delete(
        "/:id/podcasts/:podcastId",
        authenticateToken,
        async (req, res) => {
            const playlistId = req.params.id;
            const podcastId = req.params.podcastId;
            const userId = req.user.id;

            try {
                // check playlist ownership
                const [owner] = await db.query(
                    "SELECT user_id FROM playlists WHERE id = ? AND user_id = ?",
                    [playlistId, userId]
                );

                if (owner.length === 0) {
                    return res
                        .status(403)
                        .json({ error: "Unauthorized to modify playlist." });
                }

                // remove podcast
                const [result] = await db.query(
                    `
                DELETE FROM podcast_playlist 
                WHERE playlist_id = ? AND podcast_id = ?;
                `,
                    [playlistId, podcastId]
                );

                if (result.affectedRows === 0) {
                    return res
                        .status(404)
                        .json({ error: "Podcast not found in playlist." });
                }

                res.json({ message: "Podcast removed from playlist." });
            } catch (error) {
                console.error("Error removing podcast from playlist:", error);
                res.status(500).json({ error: "Internal server error." });
            }
        }
    );

    return router;
};
