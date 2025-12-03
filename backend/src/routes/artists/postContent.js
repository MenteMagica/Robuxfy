const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();

    const { insertMusic } = require("../../services/artists/insertMusic");
    const { insertPodcast } = require("../../services/artists/insertPodcast");
    const { insertAlbum } = require("../../services/artists/insertAlbum");

    // creates a new content (music, podcast or album)
    router.post("/content", authMiddleware, isArtist, async (req, res) => {
        const artistId = req.artistId;
        const { content_type, title, release_date, uploads } = req.body;

        // basic validation
        if (!content_type || !title || !release_date) {
            return res.status(400).json({
                error: "content_type, title, and release_date are required.",
            });
        }

        // validation
        if (!uploads || !Array.isArray(uploads)) {
            throw new Error("Uploads array is missing.");
        }

        // connects to db
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
                    itemId = await insertAlbum(connection, artistId, req.body);
                    responseMessage = "Album posted successfully.";

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
            // rollback if it fails
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

    return router;
};
