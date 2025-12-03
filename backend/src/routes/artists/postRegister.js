const express = require("express");

module.exports = (db, authMiddleware, isArtist) => {
    const router = express.Router();
    // create an artist profile
    router.post("/register", authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { name, biography, banner } = req.body;

        // name validation
        if (!name) {
            return res.status(400).json({
                error: "Name is required.",
            });
        }

        try {
            // uniqueness check: verify if the user is already an artist
            const [artistCheck] = await db.query(
                "SELECT id FROM artists WHERE id = ?",
                [userId]
            );

            if (artistCheck.length > 0) {
                return res.status(409).json({
                    error: "You are already registered as an artist.",
                });
            }

            // insert artist record
            const insertQuery = `
            INSERT INTO artists (id, name, biography, banner)
            VALUES (?, ?, ?, ?);
        `;
            await db.query(insertQuery, [
                userId,
                name,
                biography || null,
                banner || null,
            ]);

            // success response
            res.status(201).json({
                message: "Successfully registered as an artist!",
                artistId: userId,
            });
        } catch (error) {
            console.error("Artist registration error:", error);
            res.status(500).json({
                error: "Error registering user as artist.",
            });
        }
    });

    return router;
};
