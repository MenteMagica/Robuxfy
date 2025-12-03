const express = require("express");

module.exports = () => {
    const router = express.Router();
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });
    const validatePath = require("../../services/minio/mediaValidation");
    const { uploadMedia } = require("../../services/minio/mediaController");
    const { authMiddleware } = require("../../middlewares/authToken");

    // upload archives
    router.post(
        "/upload",
        authMiddleware,
        upload.array("files"),
        async (req, res) => {
            try {
                if (!req.files || req.files.length === 0) {
                    return res
                        .status(400)
                        .json({ error: "No files provided." });
                }

                if (!req.body.metadata) {
                    return res.status(400).json({ error: "Metadata missing." });
                }

                // extract each file metadata
                let metadatas;
                try {
                    metadatas = JSON.parse(req.body.metadata);
                } catch {
                    return res
                        .status(400)
                        .json({ error: "Invalid metadata format." });
                }

                if (metadatas.length !== req.files.length) {
                    return res.status(400).json({
                        error: "Metadata count does not match files count.",
                    });
                }

                const uploadedFiles = [];

                // loop through files
                for (let i = 0; i < req.files.length; i++) {
                    const meta = metadatas[i];

                    // valida filetype e type
                    try {
                        validatePath(meta);
                    } catch (err) {
                        return res.status(400).json({ error: err.message });
                    }

                    const file = req.files[i];
                    const fileInfo = {
                        filename: file.originalname,
                        mime_type: file.mimetype,
                        file_stream: file.buffer,
                    };
                    const prefixPath = `${meta.filetype}/${meta.type}`;

                    const objectKey = await uploadMedia(
                        fileInfo,
                        prefixPath,
                        meta.filetype
                    );

                    uploadedFiles.push({
                        objectKey, // minio path
                        filetype: meta.filetype, // "images" or "audios"
                        type: meta.type, // "albums_cover", "musics", etc.
                    });
                }

                res.status(201).json({
                    message: "Files uploaded successfully.",
                    files: uploadedFiles,
                });
            } catch (err) {
                console.error("Upload error:", err);
                res.status(500).json({ error: "Failed to upload files." });
            }
        }
    );

    return router;
};
