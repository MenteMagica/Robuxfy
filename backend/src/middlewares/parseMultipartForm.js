const { minio_client } = require("../database/database-minio");
const { v4: uuidv4 } = require("uuid"); // unique id

const primary_bucket = "robuxfy";

// uploads media stream to minio using a specific prefix path
async function upload_media(file_info, prefix_path) {
    const final_prefix = prefix_path.endsWith("/")
        ? prefix_path
        : `${prefix_path}/`;

    const filename_parts = file_info.filename.split(".");

    const file_extension =
        filename_parts.length > 1 ? filename_parts.pop() : "";

    const extension_suffix = file_extension ? `.${file_extension}` : "";

    const unique_filename = `${uuidv4()}.${extension_suffix}`;

    // key includes the full path: prefix/filename
    const object_key = `${final_prefix}${unique_filename}`;

    const meta_data = {
        "content-type": file_info.mime_type,
    };

    console.log(`DEBUG: Trying to upload to MinIO in ${object_key}`);

    await minio_client.putObject(
        primary_bucket,
        object_key,
        file_info.file_stream,
        meta_data
    );

    return object_key;
}

module.exports = {
    upload_media,
    primary_bucket,
};
