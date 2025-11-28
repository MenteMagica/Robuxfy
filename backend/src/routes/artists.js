module.exports = (db, authMiddleware) => {
    const express = require("express");
    const router = express.Router();

    // Middleware: verify if the authenticated user is an artist
    const isArtist = async (req, res, next) => {
        const userId = req.user.id;

        try {
            const [artistCheck] = await db.query(
                "SELECT id FROM artists WHERE id = ?",
                [userId]
            );

            if (artistCheck.length === 0) {
                return res.status(403).json({
                    error: "Access denied. You must be registered as an artist to perform this action.",
                });
            }

            req.artistId = userId;
            next();
        } catch (error) {
            console.error("isArtist middleware error:", error);
            res.status(500).json({
                error: "Internal server error during role check.",
            });
        }
    };

    // insert a single music along with its genres and collaborators
    const insertMusic = async (connection, artistId, data) => {
        const {
            title,
            release_date,
            url,
            description,
            cover_image,
            genre_ids,
            collaborators,
        } = data;

        if (!url) throw new Error("URL is required for music.");

        const dateToInsert = new Date(release_date).toISOString().slice(0, 10);
        // insert music
        const musicInsertQuery = `
            INSERT INTO musics (artist_id, title, release_date, url, description, cover_image)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [result] = await connection.query(musicInsertQuery, [
            artistId,
            title,
            dateToInsert,
            url,
            description || null,
            cover_image || null,
        ]);
        const musicId = result.insertId;

        // music genres
        if (genre_ids && Array.isArray(genre_ids) && genre_ids.length > 0) {
            const genreValues = genre_ids.map((genreId) => [musicId, genreId]);
            const genreInsertQuery = `INSERT INTO music_genre (music_id, genre_id) VALUES ?`;
            await connection.query(genreInsertQuery, [genreValues]);
        }

        // link collaborators
        if (
            collaborators &&
            Array.isArray(collaborators) &&
            collaborators.length > 0
        ) {
            const collaboratorValues = collaborators.map((collabId) => [
                collabId,
                musicId,
            ]);
            const collaboratorInsertQuery =
                "INSERT INTO artist_music (artist_id, music_id) VALUES ?";
            await connection.query(collaboratorInsertQuery, [
                collaboratorValues,
            ]);
        }

        return musicId;
    };

    // insert a podcast along with its genres
    const insertPodcast = async (connection, artistId, data) => {
        const {
            title,
            release_date,
            url,
            description,
            cover_image,
            genre_ids,
        } = data;

        if (!url) throw new Error("URL is required for podcast.");

        const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

        // insert podcast
        const podcastInsertQuery = `
            INSERT INTO podcasts (artist_id, title, release_date, url, description, cover_image)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const [result] = await connection.query(podcastInsertQuery, [
            artistId,
            title,
            dateToInsert,
            url,
            description || null,
            cover_image || null,
        ]);
        const podcastId = result.insertId;

        // podcast genres
        if (genre_ids && Array.isArray(genre_ids) && genre_ids.length > 0) {
            const genreValues = genre_ids.map((genreId) => [
                podcastId,
                genreId,
            ]);
            const genreInsertQuery = `INSERT INTO podcast_genre (podcast_id, genre_id) VALUES ?`;
            await connection.query(genreInsertQuery, [genreValues]);
        }

        return podcastId;
    };

    // routes for artists
    // register the authenticated user as an artist
    router.post("/register", authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { name, biography, banner } = req.body;

        // name validation
        if (!name) {
            return res.status(400).json({
                error: "Name is required.",
            });
        }

        try {
            // uniqueness check: verify if the user is already an artist
            const [artistCheck] = await db.query(
                "SELECT id FROM artists WHERE id = ?",
                [userId]
            );

            if (artistCheck.length > 0) {
                return res.status(409).json({
                    error: "You are already registered as an artist.",
                });
            }

            // insert artist record
            const insertQuery = `
            INSERT INTO artists (id, name, biography, banner)
            VALUES (?, ?, ?, ?);
        `;
            await db.query(insertQuery, [
                userId,
                name,
                biography || null,
                banner || null,
            ]);

            // success response
            res.status(201).json({
                message: "Successfully registered as an artist!",
                artistId: userId,
            });
        } catch (error) {
            console.error("Artist registration error:", error);
            res.status(500).json({
                error: "Error registering user as artist.",
            });
        }
    });

    // Updates the logged-in artist's profile data
    router.put("/me", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        const { name, biography, banner } = req.body;

        // dynamic update construction
        const fieldsToUpdate = [];
        const params = [];

        if (name) {
            fieldsToUpdate.push("name = ?");
            params.push(name);
        }
        if (biography !== undefined) {
            fieldsToUpdate.push("biography = ?");
            params.push(biography || null);
        }
        if (banner !== undefined) {
            fieldsToUpdate.push("banner = ?");
            params.push(banner || null);
        }

        if (fieldsToUpdate.length === 0) {
            return res
                .status(400)
                .json({ error: "No fields provided for update." });
        }

        params.push(artistId);

        try {
            const updateQuery = `
            UPDATE artists 
            SET ${fieldsToUpdate.join(", ")} 
            WHERE id = ?;
        `;

            const [result] = await db.query(updateQuery, params);

            if (result.affectedRows === 0) {
                return res.json({
                    message:
                        "Profile updated successfully (or no changes were made).",
                });
            }

            res.json({ message: "Profile updated successfully!" });
        } catch (error) {
            // unicity constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    error: "Stage name already in use by another artist.",
                });
            }
            console.error("Artist update error:", error);
            res.status(500).json({ error: "Error updating artist profile." });
        }
    });

    // Deletes the artist registration (reverts the user to a standard user)
    router.delete("/me", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId; // ID do artista/usuário logado

        try {
            const deleteQuery = "DELETE FROM artists WHERE id = ?";
            const [result] = await db.query(deleteQuery, [artistId]);

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "Artist profile not found." });
            }

            res.status(200).json({
                message:
                    "Artist profile deleted successfully. User remains active.",
            });
        } catch (error) {
            console.error("Artist deletion error:", error);
            res.status(500).json({ error: "Error deleting artist profile." });
        }
    });

    // creates a new content
    router.post("/content", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        const { content_type, title, release_date, new_tracks, cover_image } =
            req.body;

        // basic validation
        if (!content_type || !title || !release_date) {
            return res.status(400).json({
                error: "content_type, title, and release_date are required.",
            });
        }

        const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            let itemId;
            let responseMessage;

            // switch logic based on content_type
            switch (content_type) {
                case "music":
                    itemId = await insertMusic(connection, artistId, req.body);
                    responseMessage = "Music posted successfully.";
                    break;

                case "podcast":
                    itemId = await insertPodcast(
                        connection,
                        artistId,
                        req.body
                    );
                    responseMessage = "Podcast posted successfully.";
                    break;

                case "album":
                    // insert album
                    const albumInsertQuery = `
                        INSERT INTO albums (artist_id, name, release_date, cover_image)
                        VALUES (?, ?, ?, ?);
                    `;
                    const [albumResult] = await connection.query(
                        albumInsertQuery,
                        [artistId, title, dateToInsert, cover_image || null]
                    );

                    itemId = albumResult.insertId;
                    responseMessage = "Album and tracks posted successfully.";

                    // insert tracks associated with the album
                    if (
                        !new_tracks ||
                        !Array.isArray(new_tracks) ||
                        new_tracks.length === 0
                    ) {
                        throw new Error(
                            "Album creation requires the 'new_tracks' array with music data."
                        );
                    }

                    const musicValues = [];
                    for (const track of new_tracks) {
                        if (!track.title || !track.url)
                            throw new Error(
                                "All tracks must have a title and a URL."
                            );

                        musicValues.push([
                            artistId,
                            track.title,
                            dateToInsert,
                            track.url,
                            track.description || null,
                            cover_image || null,
                            itemId, // album_id
                        ]);
                    }

                    const tracksInsertQuery = `
                        INSERT INTO musics (artist_id, title, release_date, url, description, cover_image, album_id)
                        VALUES ?;
                    `;
                    await connection.query(tracksInsertQuery, [musicValues]);

                    break;

                default:
                    throw new Error("Invalid content_type.");
            }

            // commit the transaction
            await connection.commit();

            // success Response
            res.status(201).json({
                message: responseMessage,
                itemId: itemId,
            });
        } catch (error) {
            // rollback em caso de falha
            await connection.rollback();

            const errorMessage =
                error.message.includes("required") ||
                error.message.includes("track") ||
                error.message.includes("URL")
                    ? error.message
                    : "Internal error during content creation.";

            console.error(`Error creating content:`, error);
            res.status(500).json({ error: errorMessage });
        } finally {
            connection.release();
        }
    });

    // lists all music posts created by the logged-in artist.
    router.get("/me/musics", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;

        try {
            const [musics] = await db.query(
                "SELECT id, title, release_date, url FROM musics WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );

            res.json({
                total: musics.length,
                musics: musics,
            });
        } catch (error) {
            console.error("Error fetching artist posts:", error);
            res.status(500).json({ error: "Error retrieving artist posts." });
        }
    });

    // lists all albums created by the logged-in artist.
    router.get("/me/albums", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        try {
            const [albums] = await db.query(
                "SELECT id, name, release_date, cover_image FROM albums WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );
            res.json({ total: albums.length, albums: albums });
        } catch (error) {
            console.error("Error fetching artist albums:", error);
            res.status(500).json({ error: "Error retrieving artist albums." });
        }
    });

    // lists all podcasts created by the logged-in artist.
    router.get("/me/podcasts", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        try {
            const [podcasts] = await db.query(
                "SELECT id, title, release_date, url FROM podcasts WHERE artist_id = ? ORDER BY release_date DESC",
                [artistId]
            );
            res.json({ total: podcasts.length, podcasts: podcasts });
        } catch (error) {
            console.error("Error fetching artist podcasts:", error);
            res.status(500).json({
                error: "Error retrieving artist podcasts.",
            });
        }
    });

    return router;
};
