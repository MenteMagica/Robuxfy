module.exports = (db) => {
    return async (req, res, next) => {
        const user_id = req.user.id; // get user id

        try {
            // verify if the authenticated user is an artist
            const [artist_check] = await db.query(
                "SELECT id FROM artists WHERE id = ?",
                [user_id]
            );

            if (artist_check.length === 0) {
                return res.status(403).json({
                    error: "Access denied. You must be registered as an artist to perform this action.",
                });
            }

            req.artistId = user_id;
            next();
        } catch (error) {
            console.error("isArtist middleware error:", error);
            res.status(500).json({
                error: "Internal server error during role check.",
            });
        }
    };
};
