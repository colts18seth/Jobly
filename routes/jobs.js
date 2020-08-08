
const jsonschema = require("jsonschema");
const express = require("express");
const { auth, ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const partialUpdate = require("../helpers/partialUpdate");
const jobsSchema = require("../schemas/jobsSchema.json");
const ExpressError = require("../helpers/expressError");
const db = require("../db");
const jobsRoutes = new express.Router();

// make new job *only as admin
jobsRoutes.post("/", ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobsSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { title, salary, equity, company_handle } = req.body;
        const results = await db.query(
            `INSERT INTO jobs ( title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle, date_posted`,
            [title, salary, equity, company_handle]
        );

        return res.status(201).json({ job: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

// get jobs *only if logged in
jobsRoutes.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        // get jobs by search term passed in params
        if (req.query.search) {
            const { search } = req.query;
            const results = await db.query(
                `SELECT  title, company_handle
                FROM jobs WHERE title ILIKE $1`, [`%${search}%`]
            );
            return res.json({ jobs: results.rows });
        }

        // get jobs by min_salary passed in params
        if (req.query.min_salary) {
            const { min_salary } = req.query;
            const results = await db.query(
                `SELECT title, company_handle
                FROM jobs WHERE salary >= $1`, [min_salary]
            );
            return res.json({ jobs: results.rows });
        }

        // get jobs by min_equity passed in params
        if (req.query.min_equity) {
            const { min_equity } = req.query;
            const results = await db.query(
                `SELECT title, company_handle
                FROM jobs WHERE equity >= $1`, [min_equity]
            );
            return res.json({ jobs: results.rows });
        }

        // get all jobs
        const results = await db.query(
            `SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs`
        );
        return res.json({ jobs: results.rows });
    }
    catch (err) {
        return next(err);
    }
});

// get job by id passed in params
jobsRoutes.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs WHERE id=$1`, [id]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`id: "${id}" doesn't exist`, 404);
        }

        return res.json({ job: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

// update job by id passed in params
jobsRoutes.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const result = jsonschema.validate(req.body, jobsSchema);
        if (!result.valid) {
            let listOfErrors = result.errors.map(error => error.stack);
            let error = new ExpressError(listOfErrors, 400);
            return next(error);
        }

        const { id } = req.params;
        const patchResults = partialUpdate("jobs", req.body, "id", id);
        const results = await db.query(patchResults.query, patchResults.values);

        if (results.rowCount === 0) {
            throw new ExpressError(`id: "${id}" doesn't exist`, 404);
        }

        return res.status(200).json({ job: results.rows[0] });
    }
    catch (err) {
        return next(err);
    }
});

// get job by id passed in params
jobsRoutes.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `DELETE FROM jobs
            WHERE id=$1`,
            [id]
        );
        if (results.rowCount === 0) {
            throw new ExpressError(`id: "${req.params.id}" doesn't exist`, 404);
        }

        return res.status(200).json({ message: "Job deleted" });
    }
    catch (err) {
        return next(err);
    }
});

module.exports = jobsRoutes;