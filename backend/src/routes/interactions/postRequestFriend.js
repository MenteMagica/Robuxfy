const express = require("express");

module.exports = (db, authenticateToken) => {
    const router = express.Router();

    // sends a friend request to another user
    router.post("/", authenticateToken, async (req, res) => {
        const targetUsername = req.params.username;
        const user1Id = req.user.id;

        try {
            const [targetUser] = await db.query(
                `select id from users where username = ?`,
                [targetUsername]
            );

            if (targetUser.length === 0) {
                return res
                    .status(404)
                    .json({ error: "Target user not found." });
            }
            const user2Id = targetUser[0].id;

            if (user1Id === user2Id) {
                return res.status(400).json({
                    error: "You cannot send an order to yourself.",
                });
            }

            // checks for existing requests from user2 to user1
            const [inverseRequest] = await db.query(
                `select status from user_user where user1_id = ? and user2_id = ?`,
                [user2Id, user1Id]
            );

            if (
                inverseRequest.length > 0 &&
                inverseRequest[0].status === "PENDING"
            ) {
                await db.query(
                    `update user_user set status = 'ACCEPTED' where user1_id = ? and user2_id = ?`,
                    [user2Id, user1Id]
                );
                return res.status(200).json({
                    message: `The friend request from ${targetUsername} was acepted.`,
                });
            }

            // multiple requests from user1 to user2 will just update the status to PENDING again (error handling)
            await db.query(
                `
                insert into user_user (user1_id, user2_id, status) 
                values (?, ?, 'PENDING')
                on duplicate key update status = 'PENDING'
                `,
                [user1Id, user2Id]
            );

            res.status(201).json({
                message: `Friend request sent to ${targetUsername}.`,
            });
        } catch (error) {
            console.error("Error sending friend request:", error);
            res.status(500).json({
                error: "Error processing friend request.",
            });
        }
    });

    return router;
};
