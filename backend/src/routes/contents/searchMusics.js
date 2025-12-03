const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // searches for music by name
    router.get("/", async (req, res) => {
        const searchTerm = req.query.q;

        if (!searchTerm || searchTerm.trim() === "") {
            return res.status(400).json({
                error: "Search term is required.",
            });
        }

        try {
            const [results] = await db.query(
                `
                select 
                    m.id, 
                    m.title,
                    a.name as artist_name
                from 
                    musics m
                join
                    artists a on m.artist_id = a.id
                where 
                    m.title like concat('%', ?, '%')
                and 
                    m.release_date <= curdate()
                order by 
                    m.title asc
                limit 
                    10;
                `,
                [searchTerm]
            );

            res.json({
                total: results.length,
                musics: results,
            });
        } catch (error) {
            console.error("error executing music search:", error);
            res.status(500).json({ error: "error retrieving search results." });
        }
    });

    return router;
};
