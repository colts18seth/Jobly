const ExpressError = require("../../helpers/expressError");

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
    ensureAdmin
};