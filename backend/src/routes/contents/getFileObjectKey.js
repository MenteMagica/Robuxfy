const express = require("express");
const router = express.Router();
const minioClient = require("../../services/minio/client");
const { MINIO_BUCKET } = require("../../services/minio/mediaController");
const { authMiddleware } = require("../../middlewares/authToken");

// get a file
router.get("/", authMiddleware, async (req, res) => {
    try {
        const objectKey = decodeURIComponent(req.params.objectKey);

        // get object metadata and so get content-type
        const stat = await minioClient.statObject(MINIO_BUCKET, objectKey);
        res.setHeader(
            "Content-Type",
            stat.metaData["content-type"] || "application/octet-stream"
        );

        // get object como stream
        const stream = await minioClient.getObject(MINIO_BUCKET, objectKey);

        // envia o stream direto para o frontend
        stream.pipe(res);
    } catch (err) {
        console.error("Error fetching file from MinIO:", err);
        res.status(404).json({ error: "File not found." });
    }
});

module.exports = router;
