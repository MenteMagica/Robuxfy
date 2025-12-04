const express = require("express");
const router = express.Router();
const { minioClient } = require("../../services/minio/client");
const { MINIO_BUCKET } = require("../../services/minio/mediaController");

// simple public media proxy
router.get("/", async (req, res) => {
    // full path after /media base
    const full = req.url;

    // remove leading slash
    const encoded = full.startsWith("/") ? full.slice(1) : full;

    // decoded version
    const decoded = decodeURIComponent(encoded);

    // choose decoded for minio (correct path)
    const objectKey = decoded;

    if (!objectKey) {
        return res.status(400).json({ error: "missing object key" });
    }

    try {
        // get metadata
        const stat = await minioClient.statObject(MINIO_BUCKET, objectKey);

        // lower-case metadata
        const meta = Object.fromEntries(
            Object.entries(stat.metaData).map(([k, v]) => [k.toLowerCase(), v])
        );

        const type = meta["content-type"] || "application/octet-stream";

        res.setHeader("content-type", type);
        res.setHeader("content-length", stat.size);

        // stream file
        const stream = await minioClient.getObject(MINIO_BUCKET, objectKey);
        stream.pipe(res);
    } catch (err) {
        console.error("minio error:", err);
        return res.status(404).json({ error: "file not found" });
    }
});

module.exports = router;
