const updateImage = require("../utils/updateImage");

// generalize image update process
async function handleImageUpdate({
    db,
    tableName,
    columnName,
    recordId,
    imageFile,
    imageType,
}) {
    // no image
    if (!imageFile) {
        throw new Error("No image provided");
    }
    // database conection
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // update image parameters
        const params = {
            connection,
            tableName,
            columnName,
            recordId,
            imageFile,
            imageType,
        };
        const result = await updateImage(params);

        await connection.commit();

        return result;
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { handleImageUpdate };
