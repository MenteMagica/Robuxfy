const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // searches for albums by name
    router.get("/search/albums", async (req, res) => {
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
                    al.id, 
                    al.title,
                    ar.name as artist_name
                from 
                    albums al
                join
                    artists ar on al.artist_id = ar.id
                where 
                    al.title like concat('%', ?, '%')
                and 
                    al.release_date <= curdate()
                order by 
                    al.title asc
                limit 
                    10;
                `,
                [searchTerm]
            );

            res.json({
                total: results.length,
                albums: results,
            });
        } catch (error) {
            console.error("error executing album search:", error);
            res.status(500).json({ error: "error retrieving search results." });
        }
    });

    return router;
};
