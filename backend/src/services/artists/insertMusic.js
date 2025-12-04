// insert a single music along with its genres and collaborators
const insertMusic = async (connection, artist_id, data) => {
    const {
        title,
        release_date,
        description,
        genre_ids,
        collaborators,
        uploads,
    } = data;
    const cover = uploads.find((u) => u.filetype === "images");
    const audio = uploads.find((u) => u.filetype === "audios");

    if (!cover) {
        throw new Error("Cover image is required for music.");
    }

    if (!audio) {
        throw new Error("Audio file is required for music.");
    }

    if (!title || !release_date) {
        throw new Error("Title and release_date are required for music.");
    }

    // format date
    const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

    // insert cover image
    const [imageResult] = await connection.query(
        "INSERT INTO images (type, url) VALUES (?, ?)",
        [cover.type, cover.objectKey]
    );
    const coverImageId = imageResult.insertId;

    // insert music
    const musicInsertQuery = `
        INSERT INTO musics (artist_id, title, release_date, url, description, cover_image)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const [musicResult] = await connection.query(musicInsertQuery, [
        artist_id,
        title,
        dateToInsert,
        audio.objectKey,
        description || null,
        coverImageId,
    ]);

    const music_id = musicResult.insertId;

    // insert genres
    if (genre_ids && Array.isArray(genre_ids) && genre_ids.length > 0) {
        const genreValues = genre_ids.map((genre_id) => [music_id, genre_id]);
        await connection.query(
            "INSERT INTO music_genre (music_id, genre_id) VALUES ?",
            [genreValues]
        );
    }

    // insert collaborators
    if (
        collaborators &&
        Array.isArray(collaborators) &&
        collaborators.length > 0
    ) {
        const collaboratorValues = collaborators.map((collab_id) => [
            collab_id,
            music_id,
        ]);

        await connection.query(
            "INSERT INTO artist_music (artist_id, music_id) VALUES ?",
            [collaboratorValues]
        );
    }

    return music_id;
};

module.exports = {
    insertMusic,
};
