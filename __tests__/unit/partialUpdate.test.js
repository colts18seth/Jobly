process.env.NODE_ENV = "test";
const request = require("supertest");
const partialUpdate = require("../../helpers/partialUpdate");
const app = require("../../app");
const db = require("../../db");

beforeAll(async function () {
    await db.query("DELETE FROM companies");
});

beforeAll(async function () {
    await request(app)
        .post("/companies")
        .send({
            "handle": "GOOG",
            "name": "Google",
            "num_employees": 10000,
            "description": "Google everything",
            "logo_url": "google.com"
        });
});

describe("partialUpdate()", () => {

    test("should generate a proper partial update query with just 1 field",
        async function () {
            const updateItem = { "description": "Updated description" }
            const result = partialUpdate("companies", updateItem, "handle", "GOOG");
            const results = await db.query(result.query, result.values);
            expect(results.rows[0]).toEqual(
                {
                    "handle": "GOOG",
                    "name": "Google",
                    "num_employees": 10000,
                    "description": "Updated description",
                    "logo_url": "google.com"
                })
        });
});