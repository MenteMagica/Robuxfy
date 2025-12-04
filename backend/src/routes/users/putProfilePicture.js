const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    // importa diretamente updateImage
    const { updateImage } = require("../../utils/updateImage");

    router.put(
        "/",
        authMiddleware,
        upload.single("profile_picture"),
        async (req, res) => {
            const userId = req.user.id;
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
                    tableName: "users",
                    columnName: "profile_picture",
                    recordId: userId,
                    imageFile,
                    imageType: "users_profile",
                };

                const result = await updateImage(params);

                await connection.commit();

                res.json({
                    message: "Profile picture updated successfully",
                    profile_picture_id: result.newImageId,
                    url: result.newObjectKey,
                });
            } catch (error) {
                if (connection) await connection.rollback();
                console.error("PUT /users/profile-picture error:", error);

                res.status(500).json({
                    error: "Error updating profile picture",
                });
            } finally {
                if (connection) connection.release();
            }
        }
    );

    return router;
};
