const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });
    const handleImageUpdate = require("../../utils/handleImageUpdate");

    // insert a new user profile picture and remove old file
    router.put(
        "/profile-picture",
        authMiddleware,
        upload.single("profile_picture"),
        async (req, res) => {
            const userId = req.user.id;
            const imageFile = req.file;

            try {
                const result = await handleImageUpdate({
                    db,
                    tableName: "users",
                    columnName: "profile_picture",
                    recordId: userId,
                    imageFile,
                    imageType: "users_profile",
                });

                res.json({
                    message: "Profile picture updated successfully",
                    profile_picture_id: result.newImageId,
                    url: result.newObjectKey,
                });
            } catch (error) {
                if (connection) await connection.rollback();
                console.error("Profile picture update error:", error);
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
