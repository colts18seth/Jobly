const express = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const jsonschema = require("jsonschema");
const usersSchema = require("../schemas/usersSchema.json");
const usersRoutes = new express.Router();

usersRoutes.post("/", async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, usersSchema);

        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { username, password, first_name, last_name, email, photo_url, is_admin } = req.body;
        const results = await db.query(
            `INSERT INTO users ( username, password, first_name, last_name, email, photo_url, is_admin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING username, password, first_name, last_name, email, photo_url, is_admin`,
            [username, password, first_name, last_name, email, photo_url, is_admin]
        );

        return res.status(201).json({ user: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

usersRoutes.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT username, first_name, last_name, email
            FROM users`
        );
        return res.json({ users: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

usersRoutes.get("/:username", async (req, res, next) => {
    try {
        const { username } = req.params;
        const results = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
            FROM users WHERE username=$1`, [username]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`username: "${username}" doesn't exist`, 404);
        }

        return res.json({ user: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

usersRoutes.patch("/:username", async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, usersSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { username } = req.params;

        const patchResults = partialUpdate("users", req.body, "username", username);

        const results = await db.query(patchResults.query, patchResults.values);

        if (results.rowCount === 0) {
            throw new ExpressError(`username: "${username}" doesn't exist`, 404);
        }

        return res.status(200).json({ user: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

usersRoutes.delete("/:username", async (req, res, next) => {
    try {
        const { username } = req.params;
        const results = await db.query(
            `DELETE FROM users
            WHERE username=$1`,
            [username]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`username: "${req.params.username}" doesn't exist`, 404);
        }

        return res.status(200).json({ message: "User deleted" });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = usersRoutes;