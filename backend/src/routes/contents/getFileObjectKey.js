const express = require("express");
const router = express.Router();
const { minioClient } = require("../services/minio/client");
const { MINIO_BUCKET } = require("../../services/minio/mediaController.js");

// get file from minio
router.get("/*", async (req, res) => {
    const objectKey = req.params[0]; // get everything after media/

    if (!objectKey) {
        return res.status(400).json({ error: "Missing object key." });
    }

    try {
        // retrieve file from
        const stat = await minioClient.statObject(MINIO_BUCKET, objectKey);

        res.setHeader(
            "Content-Type",
            stat.metaData["content-type"] || "application/octet-stream"
        );
        res.setHeader("Content-Length", stat.size);

        // minio stream
        const objectStream = await minioClient.getObject(
            MINIO_BUCKET,
            objectKey
        );
        objectStream.pipe(res);
    } catch (err) {
        console.error("MinIO stream error:", err);
        return res.status(404).json({ error: "File not found." });
    }
});

module.exports = router;
