const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // accepts a friend request from another user
    router.post("/", authenticateToken, async (req, res) => {
        const initiatorUsername = req.params.username;
        const user2Id = req.user.id;

        try {
            // fetch ID of the initiator user
            const [initiatorUser] = await db.query(
                `select id from users where username = ?`,
                [initiatorUsername]
            );

            if (initiatorUser.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Initiator user not found." });
            }
            const user1Id = initiatorUser[0].id;

            // update the status to ACCEPTED if there is a PENDING request
            const [result] = await db.query(
                `
                update user_user 
                set status = 'ACCEPTED'
                where user1_id = ? and user2_id = ? and status = 'PENDING'
                `,
                [user1Id, user2Id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Pending request not found for this user.",
                });
            }

            res.status(200).json({
                message: `Friend request from ${initiatorUsername} accepted.`,
            });
        } catch (error) {
            console.error("Error accepting friend request:", error);
            res.status(500).json({
                error: "Error processing order acceptance.",
            });
        }
    });

    return router;
};
