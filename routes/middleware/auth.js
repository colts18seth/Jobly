const { SECRET_KEY } = require("../../config");
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    try {
        const tokenFromBody = req.body.token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload;
        return next();
    }
    catch (err) {
        return next()
    }
}

module.exports = {
    auth
};