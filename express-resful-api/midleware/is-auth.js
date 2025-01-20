const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const err = new Error('Not Authenticated');
        err.statusCode = 401;
        throw err;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'supersecretsupersecretsupersecretsupersecret');
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }

    if (!decodedToken) {
        const err = new Error('Not authenticated!');
        err.statusCode = 401;
        throw err;
    }

    req.userId = decodedToken.userId;
    next();
}