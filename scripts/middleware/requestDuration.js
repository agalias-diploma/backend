const getDurationInMilliseconds = require('../helpers/getDurationInMilliseconds'); // my helper script

function duration(req, res, next) {
    console.log(`${req.method} ${req.originalUrl} STARTED`);
    const getDurationInMs = getDurationInMilliseconds.getDurationInMilliseconds;
    const start = process.hrtime();

    res.on('finish', () => {
        const durationInMs = getDurationInMs(start);
        console.log(
            `${req.method} ${req.originalUrl} FINISHED in ${durationInMs.toLocaleString()} ms`,
        );
    });

    next();
}

module.exports = {
    duration,
};
