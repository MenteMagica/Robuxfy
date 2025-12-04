const { Readable } = require("stream");

const allowedTypes = {
    images: [
        "users_profile",
        "artists_banner",
        "musics_cover",
        "albums_cover",
        "podcasts_cover",
        "playlists_cover",
    ],
    audios: ["musics", "podcasts"],
};

function validatePath(category, type) {
    if (!["images", "audios"].includes(category)) {
        throw new Error("Invalid filetype.");
    }

    if (!allowedTypes[category].includes(type)) {
        throw new Error(`Invalid type for ${category}.`);
    }
}

// allowed type of files
const allowedFiles = {
    images: {
        mimes: ["image/jpeg", "image/png", "image/webp"],
        exts: ["jpg", "jpeg", "png", "webp"],
    },
    audios: {
        mimes: ["audio/mpeg", "audio/wav", "audio/ogg"],
        exts: ["mp3", "wav", "ogg"],
    },
};

// validate file metadata
function validateFileInfo(fileInfo) {
    if (!fileInfo || typeof fileInfo !== "object") {
        throw new Error("'fileInfo' must be an object.");
    }
    if (!fileInfo.file_stream) {
        throw new Error("'file_stream' is required.");
    }
    if (!fileInfo.filename) {
        throw new Error("'filename' is required.");
    }
    if (!fileInfo.mime_type) {
        throw new Error("'mime_type' is required.");
    }
}

// validate by category (image, audio)
function validateFile(fileInfo, category) {
    validateFileInfo(fileInfo); // base validation

    const rules = allowedFiles[category];
    if (!rules) throw new Error(`Unknown validation category: ${category}`);

    const { filename, mime_type } = fileInfo;
    const ext = filename.split(".").pop().toLowerCase();

    if (!rules.mimes.includes(mime_type)) {
        throw new Error(
            `Invalid file type. Allowed: ${rules.mimes.join(", ")}`
        );
    }
    if (!rules.exts.includes(ext)) {
        throw new Error(`Invalid extension. Allowed: ${rules.exts.join(", ")}`);
    }
}

// convert to stream
function getReadableStream(fileStream) {
    return Buffer.isBuffer(fileStream) ? Readable.from(fileStream) : fileStream;
}

module.exports = {
    validateFile,
    getReadableStream,
    validatePath,
};
