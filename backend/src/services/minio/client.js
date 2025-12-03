const minio = require("minio");

// minio client configuration
const config = {
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
};

const minioClient = new minio.Client(config);

async function initializeMinio(bucketName) {
    try {
        const exists = await minioClient.bucketExists(bucketName);

        if (!exists) {
            throw new Error(
                `Error: the required bucket "${bucketName}" does not exist.`
            );
        } else {
            console.log(
                `MinIO: connection established, bucket "${bucketName}" found.`
            );
        }
    } catch (error) {
        console.error("MinIO error:", error.message);
        throw error;
    }
}

module.exports = {
    minioClient,
    initializeMinio,
};
