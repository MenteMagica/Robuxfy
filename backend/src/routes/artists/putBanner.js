const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });
    const { updateImage } = require("../../utils/updateImage");

    router.put(
        "/",
        authMiddleware,
        isArtist,
        upload.single("banner"),
        async (req, res) => {
            const artistId = req.artistId;
            const imageFile = req.file;
            let connection;

            try {
                connection = await db.getConnection();
                await connection.beginTransaction();

                if (!imageFile) {
                    throw new Error("No image provided");
                }

                const params = {
                    connection,
                    tableName: "artists",
                    columnName: "banner",
                    recordId: artistId,
                    imageFile,
                    imageType: "artists_banner",
                };

                const result = await updateImage(params);

                await connection.commit();

                res.json({
                    message: "Banner updated successfully",
                    banner_id: result.newImageId,
                    url: result.newObjectKey,
                });
            } catch (error) {
                if (connection) await connection.rollback();
                console.error("PUT /artists/banner error:", error);

                res.status(500).json({
                    error: "Error updating banner.",
                });
            } finally {
                if (connection) connection.release();
            }
        }
    );

    return router;
};
