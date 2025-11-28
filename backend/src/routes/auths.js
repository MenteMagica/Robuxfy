module.exports = (db, bcrypt, jwt, JWT_SECRET, upload_media) => {
    const express = require("express");
    const router = express.Router();
    const salt_rounds = 10;

    // setup multer (buffer)
    const multer = require("multer");
    const upload = multer({ storage: multer.memoryStorage() });

    // register route (POST /auth/register)
    router.post(
        "/register",
        upload.single("profile_picture"),
        async (req, res) => {
            const fields = req.body;
            const image_file = req.file;

            // fields: text data
            const { username, date_of_birth, email, password } = fields;

            if (!username || !email || !password || !date_of_birth) {
                return res.status(400).json({
                    error: "there are missing required fields.",
                });
            }

            let profile_picture_id = null;
            let minio_object_key = null;
            let connection;

            try {
                // initialize transaction
                connection = await db.getConnection();
                await connection.beginTransaction();

                if (image_file) {
                    const image_type = "users_profile";
                    const prefix_path = `images/${image_type}`;

                    // create a stream from archive buffer
                    const minio_upload_info = {
                        file_stream: require("stream").Readable.from(
                            image_file.buffer
                        ),
                        filename: image_file.originalname,
                        mime_type: image_file.mimetype,
                    };

                    // upload to MinIO
                    minio_object_key = await upload_media(
                        minio_upload_info,
                        prefix_path
                    );

                    // insert images data in db
                    const image_query = `
                    insert into images (type, url)
                    values (?, ?);
                `;
                    const [image_result] = await connection.query(image_query, [
                        image_type,
                        minio_object_key,
                    ]);

                    profile_picture_id = image_result.insertId;
                }

                // generate hash
                const password_hash = await bcrypt.hash(password, salt_rounds);

                // insert new user in db
                const user_query = `
                insert into users (username, date_of_birth, email, password_hash, profile_picture)
                values (?, ?, ?, ?, ?);
            `;
                const [user_result] = await connection.query(user_query, [
                    username,
                    date_of_birth,
                    email,
                    password_hash,
                    profile_picture_id,
                ]);

                // insertions succeed
                await connection.commit();

                // success response
                res.status(201).json({
                    message: "user registered successfully!",
                    user_id: user_result.insertId,
                    profile_picture_id: profile_picture_id,
                });
            } catch (error) {
                if (connection) {
                    await connection.rollback();
                }

                // unicity constraint violation (duplicate email/username)
                if (error.code === "er_dup_entry") {
                    return res.status(409).json({
                        error: "email or username already in use.",
                    });
                }
                // registration error
                console.error("registration error:", error);
                res.status(500).json({
                    error: "error while registering user.",
                });
            } finally {
                // Libera conexão
                if (connection) {
                    connection.release();
                }
            }
        }
    );

    // login route (POST /auth/login)
    router.post("/login", async (req, res) => {
        const { email, password } = req.body;

        try {
            // search
            const [users] = await db.query(
                "SELECT id, username, email, password_hash FROM users WHERE email = ?",
                [email]
            );
            const user = users[0];

            if (!user) {
                return res
                    .status(401)
                    .json({ error: "Invalid email or password" });
            }

            // compare passwords
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return res
                    .status(401)
                    .json({ error: "Invalid email or password" });
            }

            // generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: "7d" }
            );

            // success response
            res.json({
                message: "Login successful!",
                token: token,
                userId: user.id,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    });

    return router;
};
