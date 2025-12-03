module.exports = () => {
    return (req, res, next) => {
        const start = process.hrtime();

        next();

        // log after response finishes
        res.on("finish", () => {
            const elapsed = process.hrtime(start);
            const durationMs = elapsed[0] * 1000 + elapsed[1] / 1e6;

            const logMessage =
                `[${new Date().toISOString()}] ` +
                `IP: ${req.ip || "N/A"} - ` +
                `STATUS: ${res.statusCode} - ` +
                `TIME: ${durationMs.toFixed(3)}ms - ` +
                `${req.method} ${req.originalUrl}`;

            console.log(logMessage);
        });
    };
};
