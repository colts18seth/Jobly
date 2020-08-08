const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");
const { SECRET_KEY } = require("../config");

// check if body contains token. If so, verify token and add token contents to req.user
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

// if auth found token in body, user is logged in
function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

// check if auth found token in body and the username matches the username passed in the params
function ensureCorrectUser(req, res, next) {
    if (!req.user || req.user.user.username != req.params.username) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

// check if auth found token in body and the user is admin
function ensureAdmin(req, res, next) {
    if (!req.user || !req.user.user.is_admin) {
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