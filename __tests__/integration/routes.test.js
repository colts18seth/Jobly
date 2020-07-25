process.env.NODE_ENV = "test";
const request = require("supertest");
const partialUpdate = require("../../helpers/partialUpdate");
const app = require("../../app");
const db = require("../../db");

beforeAll(async function () {
    await db.query("DELETE FROM companies");
});

describe("POST /companies", () => {

    test("make new company", async function () {
        await request(app)
            .post("/companies")
            .send({
                "handle": "GOOG",
                "name": "Google",
                "num_employees": 10000,
                "description": "Google everything",
                "logo_url": "google.com"
            });
        const results = await request(app)
            .get("/companies")
        expect(results.body).toEqual(
            {
                companies: [{
                    "handle": "GOOG",
                    "name": "Google",
                    "num_employees": 10000,
                    "description": "Google everything",
                    "logo_url": "google.com"
                }]
            });
    });
});

describe("GET /companies", () => {

    test("get all companies OR filter with query strings",
        async function () {
            const results = await request(app)
                .get("/companies")
            expect(results.body).toEqual(
                {
                    companies: [{
                        "handle": "GOOG",
                        "name": "Google",
                        "num_employees": 10000,
                        "description": "Google everything",
                        "logo_url": "google.com"
                    }]
                });
        });
});