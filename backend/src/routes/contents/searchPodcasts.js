const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // searches for podcasts by name
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
                    p.id, 
                    p.title, 
                    a.name as artist_name
                from 
                    podcasts p
                join
                    artists a on p.artist_id = a.id
                where 
                    p.title like concat('%', ?, '%')
                and 
                    p.release_date <= curdate()
                order by 
                    p.title asc
                limit 
                    10;
                `,
                [searchTerm]
            );

            res.json({
                total: results.length,
                podcasts: results,
            });
        } catch (error) {
            console.error("error executing podcast search:", error);
            res.status(500).json({ error: "error retrieving search results." });
        }
    });

    return router;
};
