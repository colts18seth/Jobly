const express = require("express");
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const partialUpdate = require("../helpers/partialUpdate");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const jobsRoutes = new express.Router();

jobsRoutes.post("/", async (req, res, next) => {
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

module.exports = jobsRoutes;