const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });
    const handleImageUpdate = require("../../utils/handleImageUpdate");

    // insert a new banner image and remove old file
    router.put(
        "/",
        authMiddleware,
        isArtist,
        upload.single("banner"),
        async (req, res) => {
            const artistId = req.artistId;
            const bannerFile = req.file;

            try {
                const result = await handleImageUpdate({
                    db,
                    tableName: "artists",
                    columnName: "banner",
                    recordId: artistId,
                    bannerFile,
                    imageType: "artists_banner",
                });

                res.json({
                    message: "Banner updated successfully",
                    banner_id: result.newImageId,
                    url: result.newObjectKey,
                });
            } catch (error) {
                if (connection) connection.rollback();
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
