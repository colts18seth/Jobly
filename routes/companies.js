const express = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const companyRoutes = new express.Router();

companyRoutes.get("/", async (req, res, next) => {
    try {
        if (req.query.search) {
            const { search } = req.query;
            const results = await db.query(
                `SELECT handle, name, num_employees, description, logo_url
                FROM companies WHERE name ILIKE $1`, [`%${search}%`]
            );
            return res.json({ companies: results.rows });
        }

        if (req.query.min_employees && req.query.max_employees) {
            const { min_employees, max_employees } = req.query;
            if (min_employees > max_employees) {
                throw new ExpressError(`Error: min_employees > max_employees`, 400);
            }
            const results = await db.query(
                `SELECT handle, name, num_employees, description, logo_url
                FROM companies WHERE num_employees >= $1 AND num_employees <= $2`, [min_employees, max_employees]
            );
            return res.json({ companies: results.rows });
        }

        if (req.query.min_employees) {
            const { min_employees } = req.query;
            const results = await db.query(
                `SELECT handle, name, num_employees, description, logo_url
                FROM companies WHERE num_employees >= $1`, [min_employees]
            );
            return res.json({ companies: results.rows });
        }

        if (req.query.max_employees) {
            const { max_employees } = req.query;
            const results = await db.query(
                `SELECT handle, name, num_employees, description, logo_url
                FROM companies WHERE num_employees <= $1`, [max_employees]
            );
            return res.json({ companies: results.rows });
        }

        const results = await db.query(
            `SELECT handle, name, num_employees, description, logo_url
            FROM companies`
        );
        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.get("/:handle", async (req, res, next) => {
    try {
        const { handle } = req.params;
        const results = await db.query(
            `SELECT handle, name, num_employees, description, logo_url
            FROM companies WHERE handle=$1`, [handle.toUpperCase()]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`handle: "${handle}" doesn't exist`, 404);
        }

        return res.json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.post("/", async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, companySchema);

        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { handle, name, num_employees, description, logo_url } = req.body;
        const results = await db.query(
            `INSERT INTO companies (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING handle, name, num_employees, description, logo_url`,
            [handle, name, num_employees, description, logo_url]
        );

        return res.status(201).json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.patch("/:handle", async (req, res, next) => {
    try {

        const { handle } = req.params;

        const patchResults = sqlForPartialUpdate("companies", req.body, "handle", handle.toUpperCase());

        const results = await db.query(patchResults.query, patchResults.values);

        if (results.rowCount === 0) {
            throw new ExpressError(`handle: "${handle}" doesn't exist`, 404);
        }

        // return res.status(200).json({ company: results });
        return res.status(200).json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.delete("/:handle", async (req, res, next) => {
    try {
        const { handle } = req.params;
        const results = await db.query(
            `DELETE FROM companies
            WHERE handle=$1`,
            [handle.toUpperCase()]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`handle: "${req.params.handle}" doesn't exist`, 404);
        }

        return res.status(200).json({ message: "Company deleted" });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = companyRoutes;