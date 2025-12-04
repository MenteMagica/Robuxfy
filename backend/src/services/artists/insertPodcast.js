// insert a podcast along with its genres
const insertPodcast = async (connection, artist_id, data) => {
    const { title, release_date, description, genre_ids, uploads } = data;
    const cover = uploads.find((u) => u.filetype === "images");
    const audio = uploads.find((u) => u.filetype === "audios");

    if (!cover) {
        throw new Error("Cover image is required for podcast.");
    }

    if (!audio) {
        throw new Error("Audio file is required for podcast.");
    }

    if (!title || !release_date) {
        throw new Error("Title and release_date are required for podcast.");
    }

    const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

    // insert cover image
    const [imageResult] = await connection.query(
        "INSERT INTO images (type, url) VALUES (?, ?)",
        [cover.type, cover.objectKey]
    );
    const coverImageId = imageResult.insertId;

    // insert podcast
    const podcastInsertQuery = `
        INSERT INTO podcasts (artist_id, title, release_date, url, description, cover_image)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const [result] = await connection.query(podcastInsertQuery, [
        artist_id,
        title,
        dateToInsert,
        audio.objectKey,
        description || null,
        coverImageId,
    ]);

    const podcast_id = result.insertId;

    // link genres
    if (genre_ids && Array.isArray(genre_ids) && genre_ids.length > 0) {
        const genreValues = genre_ids.map((genre_id) => [podcast_id, genre_id]);

        await connection.query(
            "INSERT INTO podcast_genre (podcast_id, genre_id) VALUES ?",
            [genreValues]
        );
    }

    return podcast_id;
};

module.exports = {
    insertPodcast,
};
