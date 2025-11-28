require("dotenv").config();

const mysql = require("mysql2/promise");

// create the pool of connections
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // limit of simultaneous connections
    queueLimit: 0, // unlimited queueing
});

// test the connection
pool.getConnection()
    .then((connection) => {
        console.log("Connected to the MySQL database successfully!");
        connection.release(); // Libera a conexão imediatamente
    })
    .catch((err) => {
        console.error("Connection failed.", err.message);
        // process.exit(1);
    });

module.exports = pool;
