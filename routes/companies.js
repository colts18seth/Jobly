const express = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const companyRoutes = new express.Router();

companyRoutes.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT handle, name, num_employees, description, logo_url FROM companies`
        );

        return res.json({ companies: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.get("/:handle", async (req, res, next) => {
    try {
        const handle = req.params.handle
        const results = await db.query(
            `SELECT handle, name, num_employees, description, logo_url
            FROM companies WHERE handle=$1`, [handle]
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
        const { handle, name, num_employees, description, logo_url } = req.body;
        const results = await db.query(
            `UPDATE companies SET name=$2, num_employees=$3, description=$4, logo_url=$5
            WHERE handle=$1
            RETURNING name, num_employees, description, logo_url`,
            [handle, name, num_employees, description, logo_url]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`handle: "${handle}" doesn't exist`, 404);
        }

        return res.status(200).json({ company: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

companyRoutes.delete("/:handle", async (req, res, next) => {
    try {
        const results = await db.query(
            `DELETE FROM companies
            WHERE handle=$1`,
            [req.params.handle]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`handle: "${req.params.handle}" doesn't exist`, 404);
        }

        return res.status(200).json({ message: "Company deleted"});
    }
    catch (err) {
        return next(err);
    }
});

module.exports = companyRoutes;