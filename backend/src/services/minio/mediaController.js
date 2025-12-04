const { v4: uuidv4 } = require("uuid");
const { minioClient } = require("./client");
const {
    validateFile,
    getReadableStream,
    validatePath,
} = require("./mediaValidation");

// minio primary bucket
const MINIO_BUCKET = process.env.MINIO_BUCKET;

function generateObjectKey(prefixPath, filename) {
    if (!prefixPath || typeof prefixPath !== "string") {
        throw new Error("'prefixPath' must be a string.");
    }

    const prefix = prefixPath.endsWith("/") ? prefixPath : `${prefixPath}/`;
    const ext = filename.includes(".")
        ? "." + filename.split(".").pop().toLowerCase()
        : "";

    return `${prefix}${uuidv4()}-${Date.now()}${ext}`;
}

// upload media in minio
async function uploadMedia(fileInfo, prefixPath, category, type) {
    validateFile(fileInfo, category); // validation
    validatePath(category, type);

    const fileStream = getReadableStream(fileInfo.file_stream);
    const objectKey = generateObjectKey(prefixPath, fileInfo.filename);

    try {
        await minioClient.putObject(MINIO_BUCKET, objectKey, fileStream, {
            "content-type": fileInfo.mime_type,
        });
        console.log("MinIO: Uploaded", objectKey);
        return objectKey;
    } catch (err) {
        console.error("MinIO upload error:", err);
        throw new Error("Failed to upload file.");
    }
}

// delete media in minio
async function deleteMedia(objectKey) {
    try {
        await minioClient.removeObject(MINIO_BUCKET, objectKey);
        console.log("MinIO: Deleted", objectKey);
        return true;
    } catch (err) {
        console.error("MinIO deletion error:", err);
        throw err;
    }
}

module.exports = {
    uploadMedia,
    deleteMedia,
    MINIO_BUCKET,
};
