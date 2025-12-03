const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // view playlist content
    router.get("/playlists/:id", authenticateToken, async (req, res) => {
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

    return router;
};
