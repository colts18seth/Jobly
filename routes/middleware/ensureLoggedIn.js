const ExpressError = require("../../helpers/expressError");

function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        const err = new ExpressError("Unauthorized", 401);
        return next(err);
    } else {
        return next();
    }
}

module.exports = {
    ensureLoggedIn
};