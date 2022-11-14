exports.sendError = (res, err, statusCode = 401) => {
    res.status(statusCode).json({ error: err.message || err });
};
