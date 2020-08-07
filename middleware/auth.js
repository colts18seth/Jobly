const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");

function auth(req, res, next) {
    try {
        const tokenFromBody = req.body._token;
        const payload = jwt.verify(tokenFromBody, SECRET_KEY);
        req.user = payload;
        return next();
    }
    catch (err) {
        return next()
    }
}

function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

function ensureCorrectUser(req, res, next) {
    if (req.user.user.username != req.params.username) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

function ensureAdmin(req, res, next) {
    console.log(req);
    if (!req.user || req.user.is_admin != "True") {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

module.exports = {
    auth,
    ensureLoggedIn,
    ensureCorrectUser,
    ensureAdmin
};