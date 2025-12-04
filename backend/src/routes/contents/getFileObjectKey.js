const express = require("express");
const router = express.Router();
const { minioClient } = require("../services/minio/client");
const { MINIO_BUCKET } = require("../../services/minio/mediaController");

// simple public media proxy
router.get("/*", async (req, res) => {
    const objectKey = req.params[0]; // path after /media/

    if (!objectKey) {
        return res.status(400).json({ error: "missing object key" });
    }

    try {
        // get file metadata
        const stat = await minioClient.statObject(MINIO_BUCKET, objectKey);

        // set headers
        const type =
            stat.metaData["content-type"] ||
            stat.metaData["Content-Type"] ||
            "application/octet-stream";

        res.setHeader("content-type", type);
        res.setHeader("content-length", stat.size);

        // stream file to client
        const stream = await minioClient.getObject(MINIO_BUCKET, objectKey);
        stream.pipe(res);
    } catch (err) {
        console.error("minio error:", err);
        return res.status(404).json({ error: "file not found" });
    }
});

module.exports = router;
