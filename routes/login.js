const express = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const loginSchema = require("../schemas/loginSchema.json");
const loginRoute = new express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

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
            `SELECT password
            FROM users
            WHERE username = $1`,
            [username]
        );
        let user = results.rows[0];
        if (user) {
            if (await bcrypt.compare(password, user.password) === true) {
                let token = jwt.sign({ username }, SECRET_KEY);
                return res.json({ token });
            }
        }
        throw new ExpressError("Invalid user/password", 400);
    }
    catch (err) {
        return next(err);
    }
});

module.exports = loginRoute;