const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const loginSchema = require("../schemas/loginSchema.json");
const ExpressError = require("../helpers/expressError");
const { SECRET_KEY } = require("../config");
const db = require("../db");
const loginRoute = new express.Router();

// login in user
loginRoute.post("/", async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, loginSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { username, password } = req.body;
        const results = await db.query(
            `SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username = $1`,
            [username]
        );
        let payload = { user: results.rows[0] };
        if (payload) {
            if (await bcrypt.compare(password, payload.user.password) === true) {
                let _token = jwt.sign(payload, SECRET_KEY);
                return res.json({ _token });
            }
        }
        throw new ExpressError("Invalid user/password", 400);
    }
    catch (err) {
        return next(err);
    }
});

module.exports = loginRoute;