const minio = require("minio");

// minio client configuration
const config = {
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
};

const minio_client = new minio.Client(config);

async function initialize_minio(bucket_name) {
    try {
        const exists = await minio_client.bucketExists(bucket_name);

        if (!exists) {
            throw new Error(
                `Error: the required bucket "${bucket_name}" does not exist.`
            );
        } else {
            console.log(
                `Minio: connection established, bucket "${bucket_name}" found.`
            );
        }
    } catch (error) {
        console.error("Minio error:", error.message);
        throw error;
    }
}

module.exports = {
    minio_client,
    initialize_minio,
};
