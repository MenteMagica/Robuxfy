const {
    uploadMedia,
    deleteMedia,
} = require("../services/minio/mediaController");
const { Readable } = require("stream");

// insert/update an image and remove old register
async function updateImage({
    connection,
    tableName, // ex: "users"
    columnName, // ex: "profile_picture"
    recordId, // ex: userId
    imageFile, // req.file
    imageType, // ex: "users_profile"
}) {
    if (
        !connection ||
        !tableName ||
        !columnName ||
        !recordId ||
        !imageFile ||
        !imageType
    ) {
        throw new Error("Missing parameters for updateImage.");
    }

    // looks up for current image
    const [rows] = await connection.query(
        `SELECT ${columnName} FROM ${tableName} WHERE id = ?`,
        [recordId]
    );

    const oldImageId = rows[0]?.[columnName] || null;
    let oldObjectKey = null;

    // get old obnject key
    if (oldImageId) {
        const [imgRows] = await connection.query(
            "SELECT url FROM images WHERE id = ?",
            [oldImageId]
        );
        if (imgRows.length > 0) oldObjectKey = imgRows[0].url;
    }

    // upload a new image
    const prefixPath = `images/${imageType}`;
    const uploadInfo = {
        file_stream: Readable.from(imageFile.buffer),
        filename: imageFile.originalname,
        mime_type: imageFile.mimetype,
    };

    const newObjectKey = await uploadMedia(uploadInfo, prefixPath, "image");

    // insert a new image
    const [imageResult] = await connection.query(
        "INSERT INTO images (type, url) VALUES (?, ?)",
        [imageType, newObjectKey]
    );

    const newImageId = imageResult.insertId;

    // update new image id
    await connection.query(
        `UPDATE ${tableName} SET ${columnName} = ? WHERE id = ?`,
        [newImageId, recordId]
    );

    // delete old image register
    if (oldImageId) {
        if (oldObjectKey) {
            try {
                await deleteMedia(oldObjectKey);
            } catch (err) {
                console.error("Failed to delete old MinIO object:", err);
            }
        }

        await connection.query("DELETE FROM images WHERE id = ?", [oldImageId]);
    }

    return {
        oldImageId,
        newImageId,
        newObjectKey,
    };
}

module.exports = { updateImage };
