module.exports = (db, bcrypt) => {
    const express = require("express");
    const router = express.Router();
    const salt_rounds = 10;

    // register a new user
    router.post("/", async (req, res) => {
        const { username, date_of_birth, email, password } = req.body;

        if (!username || !email || !password || !date_of_birth) {
            return res.status(400).json({
                error: "There are missing required fields.",
            });
        }

        let connection;
        try {
            // initialize transaction
            connection = await db.getConnection();
            await connection.beginTransaction();

            // generate password hash
            const password_hash = await bcrypt.hash(password, salt_rounds);

            // insert new user in db
            const user_query = `
                INSERT INTO users (username, date_of_birth, email, password_hash)
                VALUES (?, ?, ?, ?);
            `;
            const [user_result] = await connection.query(user_query, [
                username,
                date_of_birth,
                email,
                password_hash,
            ]);

            await connection.commit();

            // success response
            res.status(201).json({
                message: "User registered successfully!",
                user_id: user_result.insertId,
            });
        } catch (error) {
            if (connection) await connection.rollback();

            // unicity constraint violation (duplicate email/username)
            if (error.code === "er_dup_entry") {
                return res.status(409).json({
                    error: "Email or username already in use.",
                });
            }

            console.error("Registration error:", error);
            res.status(500).json({
                error: "Error while registering user.",
            });
        } finally {
            if (connection) connection.release();
        }
    });

    return router;
};
