const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // removes a friend or rejects a friend request
    router.delete("/", authenticateToken, async (req, res) => {
        const targetUsername = req.params.username;
        const loggedInUserId = req.user.id;

        try {
            // fetch id of the target user
            const [targetUser] = await db.query(
                `select id from users where username = ?`,
                [targetUsername]
            );

            if (targetUser.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Target user not found." });
            }
            const targetId = targetUser[0].id;

            // delete any relationship between the two users
            const [result] = await db.query(
                `
                delete from user_user 
                where (user1_id = ? and user2_id = ?) or (user1_id = ? and user2_id = ?)
                `,
                [loggedInUserId, targetId, targetId, loggedInUserId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "No friendships or pending requests were found with this user.",
                });
            }

            res.json({
                message: `Relationship with ${targetUsername} successfully removed/rejected.`,
            });
        } catch (error) {
            console.error("Error removing user relationship:", error);
            res.status(500).json({
                error: "Error processing relationship removal.",
            });
        }
    });

    return router;
};
