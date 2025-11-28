module.exports = (db, authenticateToken) => {
    const express = require("express");
    const router = express.Router();

    // musics interactions
    // sets is_like to true for a music track
    router.post("/musics/:id/like", authenticateToken, async (req, res) => {
        const musicId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_music (user_id, music_id, is_like) 
                values (?, ?, true)
                on duplicate key update is_like = true
                `,
                [userId, musicId]
            );

            res.status(201).json({ message: "music liked successfully." });
        } catch (error) {
            console.error("error liking music:", error);
            res.status(500).json({ error: "error processing like." });
        }
    });

    // sets is_like to false
    router.delete("/musics/:id/like", authenticateToken, async (req, res) => {
        const musicId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `
                update user_music 
                set is_like = false
                where user_id = ? and music_id = ?
                `,
                [userId, musicId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ error: "user/music record not found." });
            }

            res.json({ message: "music unliked successfully." });
        } catch (error) {
            console.error("error unliking music:", error);
            res.status(500).json({ error: "error processing unlike." });
        }
    });

    // podcast interactions
    // sets is_like to true for a podcast track
    router.post("/podcasts/:id/like", authenticateToken, async (req, res) => {
        const podcastId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_podcast (user_id, podcast_id, is_like) 
                values (?, ?, true)
                on duplicate key update is_like = true
                `,
                [userId, podcastId]
            );

            res.status(201).json({ message: "podcast liked successfully." });
        } catch (error) {
            console.error("error liking podcast:", error);
            res.status(500).json({ error: "error processing like." });
        }
    });

    // sets is_like to false
    router.delete("/podcasts/:id/like", authenticateToken, async (req, res) => {
        const podcastId = req.params.id;
        const userId = req.user.id;

        try {
            const [result] = await db.query(
                `
                update user_podcast 
                set is_like = false
                where user_id = ? and podcast_id = ?
                `,
                [userId, podcastId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "user/podcast record not found or like already inactive.",
                });
            }

            res.json({ message: "podcast unliked successfully." });
        } catch (error) {
            console.error("error unliking podcast:", error);
            res.status(500).json({ error: "error processing unlike." });
        }
    });

    // artist interactions
    // follows an artist
    router.post("/artists/:id/follow", authenticateToken, async (req, res) => {
        const artistId = req.params.id;
        const userId = req.user.id;

        try {
            await db.query(
                `
                insert into user_artist (user_id, artist_id) 
                values (?, ?)
                on duplicate key update artist_id = artist_id
                `,
                [userId, artistId]
            );

            res.status(201).json({ message: "artist followed successfully." });
        } catch (error) {
            console.error("error following artist:", error);
            res.status(500).json({ error: "error processing follow." });
        }
    });

    // unfollows an artist
    router.delete(
        "/artists/:id/follow",
        authenticateToken,
        async (req, res) => {
            const artistId = req.params.id;
            const userId = req.user.id;

            try {
                const [result] = await db.query(
                    `
                delete from user_artist 
                where user_id = ? and artist_id = ?
                `,
                    [userId, artistId]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        error: "follow not found for this user and artist.",
                    });
                }

                res.json({ message: "artist unfollowed successfully." });
            } catch (error) {
                console.error("error unfollowing artist:", error);
                res.status(500).json({ error: "error processing unfollow." });
            }
        }
    );

    // sends a friend request to another user
    router.post(
        "/users/:username/request",
        authenticateToken,
        async (req, res) => {
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
        }
    );

    // accepts a friend request from another user
    router.post(
        "/users/:username/accept",
        authenticateToken,
        async (req, res) => {
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
        }
    );

    // removes a friend or rejects a friend request
    router.delete(
        "/users/:username/unfriend",
        authenticateToken,
        async (req, res) => {
            const targetUsername = req.params.username;
            const loggedInUserId = req.user.id;

            try {
                // fetch ID of the target user
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
        }
    );

    return router;
};
