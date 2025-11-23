// Dependencies and Modules
const mysql = require("mysql");
const dotenv = require("dotenv");

// Environment Configuration
dotenv.config();

// --- MySQL Connection Configuration ---

// configurations for creating mysql connection
const connection = mysql.createConnection({
    host: process.env.HOST_VAR,
    port: process.env.PORT_VAR,
    database: process.env.DATABASE_VAR,
    user: process.env.USER_VAR,
    password: process.env.PASSWORD_VAR,
});

// executing connection
connection.connect(function (err) {
    if (err) {
        console.error("Error connecting:", err.message);
    } else {
        console.log("Connection created with mysql");
    }
});
