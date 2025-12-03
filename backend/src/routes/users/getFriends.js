const express = require("express");

module.exports = (db, authMiddleware) => {
    const router = express.Router();

    // list friends of the logged-in user
    router.get("/", authMiddleware, async (req, res) => {
        const UserId = req.user.id;

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
                [UserId, UserId, UserId]
            );

            res.json({ total: friends.length, friends });
        } catch (error) {
            console.error("error fetching friends list:", error);
            res.status(500).json({ error: "error retrieving friends list." });
        }
    });

    return router;
};
