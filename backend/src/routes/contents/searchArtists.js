const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // searches for artists by name
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
                    a.id, 
                    a.name as artist_name
                from
                    artists a
                where 
                    a.name like concat('%', ?, '%')
                order by 
                    a.name asc
                limit 
                    10;
                `,
                [searchTerm]
            );

            res.json({
                total: results.length,
                artists: results,
            });
        } catch (error) {
            console.error("error executing artist search:", error);
            res.status(500).json({ error: "error retrieving search results." });
        }
    });

    return router;
};
