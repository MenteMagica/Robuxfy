// create an album, upload songs, link them, and assign genres & collaborators
async function insertAlbum(connection, artistId, data) {
    const { title, release_date, new_tracks } = data;
    const uploads = data.uploads || [];

    // get cover and audios
    const cover = uploads.find((u) => u.filetype === "images");
    const audioFiles = uploads.filter((u) => u.filetype === "audios");

    if (!cover) {
        throw new Error("Album cover image is required.");
    }

    if (!new_tracks || !Array.isArray(new_tracks) || new_tracks.length === 0) {
        throw new Error("Album requires 'new_tracks' array with music data.");
    }

    if (audioFiles.length !== new_tracks.length) {
        throw new Error(
            `Track count mismatch: ${new_tracks.length} metadata but ${audioFiles.length} audio files.`
        );
    }

    if (!title || !release_date) {
        throw new Error("Title and release_date are required.");
    }

    // insert cover image
    const [imageResult] = await connection.query(
        "INSERT INTO images (type, url) VALUES (?, ?)",
        [cover.type, cover.objectKey]
    );
    const coverImageId = imageResult.insertId;

    // format date
    const dateToInsert = new Date(release_date).toISOString().slice(0, 10);

    // insert album
    const [albumResult] = await connection.query(
        `INSERT INTO albums (artist_id, title, release_date, cover_image)
         VALUES (?, ?, ?, ?)`,
        [artistId, title, dateToInsert, coverImageId]
    );
    const albumId = albumResult.insertId;

    // insert each track like insertMusic
    for (let i = 0; i < new_tracks.length; i++) {
        const track = new_tracks[i];
        const audio = audioFiles[i];

        // insert music
        const [musicResult] = await connection.query(
            `INSERT INTO musics (artist_id, title, release_date, url, description, cover_image, album_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                artistId,
                track.title,
                dateToInsert,
                audio.objectKey,
                track.description || null,
                coverImageId,
                albumId,
            ]
        );
        const musicId = musicResult.insertId;

        // insert genres
        if (
            track.genre_ids &&
            Array.isArray(track.genre_ids) &&
            track.genre_ids.length > 0
        ) {
            const genreValues = track.genre_ids.map((genreId) => [
                musicId,
                genreId,
            ]);
            await connection.query(
                "INSERT INTO music_genre (music_id, genre_id) VALUES ?",
                [genreValues]
            );
        }

        // insert collaborators
        if (
            track.collaborators &&
            Array.isArray(track.collaborators) &&
            track.collaborators.length > 0
        ) {
            const collaboratorValues = track.collaborators.map((collabId) => [
                collabId,
                musicId,
            ]);
            await connection.query(
                "INSERT INTO artist_music (artist_id, music_id) VALUES ?",
                [collaboratorValues]
            );
        }
    }

    return albumId;
}

module.exports = { insertAlbum };
