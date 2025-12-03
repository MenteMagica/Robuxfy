// create an album, upload songs and link them
async function insertAlbum(connection, artistId, data) {
    const { title, release_date, new_tracks } = data;
    const cover = data.find((u) => u.filetype === "images");
    const tracks = data.filter((u) => u.filetype === "audios");

    if (!cover) {
        throw new Error("Album cover image is required.");
    }

    if (!new_tracks || !Array.isArray(new_tracks) || new_tracks.length === 0) {
        throw new Error("Album requires 'new_tracks' array with music data.");
    }

    if (tracks.length !== new_tracks.length) {
        throw new Error(
            `Track count mismatch: ${new_tracks.length} metadata but ${tracks.length} audio files.`
        );
    }

    // combine new_tracks and audio uploads
    const tracksCombined = new_tracks.map((track, index) => ({
        title: track.title,
        description: track.description || null,
        url: tracks[index].objectKey,
    }));

    if (!title || !release_date) {
        throw new Error("Title and release_date are required.");
    }

    // insert cover image
    const [imageResult] = await connection.query(
        "INSERT INTO images (type, url) VALUES (?, ?)",
        [cover.type, cover.objectKey]
    );
    const imageId = imageResult.insertId;

    // format date
    const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

    // insert album
    const [albumResult] = await connection.query(
        `
            INSERT INTO albums (artist_id, title, release_date, cover_image)
            VALUES (?, ?, ?, ?);
        `,
        [artistId, title, dateToInsert, imageId]
    );
    const albumId = albumResult.insertId;

    // insert each track
    const musicValues = tracksCombined.map((track) => [
        artistId,
        track.title,
        dateToInsert,
        track.url,
        track.description,
        imageId,
        albumId,
    ]);

    await connection.query(
        `
            INSERT INTO musics (artist_id, title, release_date, url, description, cover_image, album_id)
            VALUES ?;
        `,
        [musicValues]
    );

    return albumId;
}

module.exports = { insertAlbum };
