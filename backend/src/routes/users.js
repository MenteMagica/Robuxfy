module.exports = (db, authMiddleware) => {
    const express = require("express");
    const router = express.Router();

    // fetch logged-in user profile data
    router.get("/me", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [users] = await db.query(
                `
                select 
                    id, 
                    username, 
                    email, 
                    date_of_birth,
                    created_at 
                from 
                    users 
                where 
                    id = ?
                `,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: "user not found." });
            }

            res.json({ user: users[0] });
        } catch (error) {
            console.error("error fetching user profile:", error);
            res.status(500).json({ error: "internal server error." });
        }
    });

    // update logged-in user profile data
    router.put("/me", authMiddleware, async (req, res) => {
        const userId = req.user.id;
        const { username, email, password } = req.body;

        if (!username && !email && !password) {
            return res.status(400).json({
                error: "at least one field (username, email, or password) must be provided for update.",
            });
        }

        try {
            let updateQuery = "update users set ";
            const updateValues = [];

            // handle username update
            if (username) {
                updateQuery += "username = ?, ";
                updateValues.push(username);
            }

            // handle email update
            if (email) {
                updateQuery += "email = ?, ";
                updateValues.push(email);
            }

            // handle password update (needs hashing)
            if (password) {
                const SALT_ROUNDS = 10;
                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
                updateQuery += "password_hash = ?, ";
                updateValues.push(hashedPassword);
            }

            // remove trailing comma and space
            updateQuery = updateQuery.slice(0, -2);
            updateQuery += " where id = ?";
            updateValues.push(userId);

            // execute update
            await db.query(updateQuery, updateValues);

            res.json({ message: "user profile updated successfully." });
        } catch (error) {
            // handle unicity constraint violation for new email/username
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    error: "the new email or username is already in use.",
                });
            }
            console.error("error updating user profile:", error);
            res.status(500).json({
                error: "internal server error during profile update.",
            });
        }
    });

    // list musics liked by the user
    router.get("/me/musics/likes", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [musics] = await db.query(
                `
                SELECT 
                    m.id, 
                    m.title, 
                    a.name AS artist_name, 
                    m.cover_image
                FROM 
                    user_music um
                JOIN 
                    musics m ON um.music_id = m.id
                JOIN
                    artists a ON m.artist_id = a.id
                WHERE 
                    um.user_id = ? AND um.is_like = TRUE;
                `,
                [userId]
            );

            res.json({ total: musics.length, musics });
        } catch (error) {
            console.error("error fetching liked musics:", error);
            res.status(500).json({
                error: "error retrieving liked musics list.",
            });
        }
    });

    // list podcasts liked by the user
    router.get("/me/podcasts/likes", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [podcasts] = await db.query(
                `
                SELECT 
                    p.id, 
                    p.title, 
                    a.name AS artist_name, 
                    p.cover_image
                FROM 
                    user_podcast up
                JOIN 
                    podcasts p ON up.podcast_id = p.id
                JOIN
                    artists a ON p.artist_id = a.id
                WHERE 
                    up.user_id = ? AND up.is_like = TRUE;
                `,
                [userId]
            );

            res.json({ total: podcasts.length, podcasts });
        } catch (error) {
            console.error("error fetching liked podcasts:", error);
            res.status(500).json({
                error: "error retrieving liked podcasts list.",
            });
        }
    });

    // list artists followed by the user
    router.get("/me/artists/follows", authMiddleware, async (req, res) => {
        const userId = req.user.id;

        try {
            const [artists] = await db.query(
                `
                SELECT 
                    a.id, 
                    a.name, 
                    a.cover_image
                FROM 
                    user_artist ua
                JOIN 
                    artists a ON ua.artist_id = a.id
                WHERE 
                    ua.user_id = ?;
                `,
                [userId]
            );

            res.json({ total: artists.length, artists });
        } catch (error) {
            console.error("error fetching followed artists:", error);
            res.status(500).json({
                error: "error retrieving followed artists list.",
            });
        }
    });

    // list friends of the logged-in user
    router.get("/me/friends", authMiddleware, async (req, res) => {
        const loggedInUserId = req.user.id;

        try {
            const [friends] = await db.query(
                `
                SELECT 
                    u.id, 
                    u.username, 
                    u.email
                FROM 
                    user_user uu
                JOIN 
                    users u ON u.id = CASE 
                        WHEN uu.user1_id = ? THEN uu.user2_id 
                        ELSE uu.user1_id 
                    END
                WHERE 
                    (uu.user1_id = ? OR uu.user2_id = ?) AND uu.status = 'ACCEPTED';
                `,
                [loggedInUserId, loggedInUserId, loggedInUserId]
            );

            res.json({ total: friends.length, friends });
        } catch (error) {
            console.error("error fetching friends list:", error);
            res.status(500).json({ error: "error retrieving friends list." });
        }
    });

    return router;
};
