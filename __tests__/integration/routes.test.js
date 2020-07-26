process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

// clear database before runing test
beforeAll(async function () {
    await db.query("DELETE FROM companies");
})

// populate with simple data before running test
beforeAll(async function () {
    await request(app)
        .post("/companies")
        .send({
            "handle": "MS",
            "name": "Microsoft",
            "num_employees": 10000,
            "description": "Microsoft everything",
            "logo_url": "microsoft.com"
        });
    await request(app)
        .post("/companies")
        .send({
            "handle": "APL",
            "name": "Apple",
            "num_employees": 10000,
            "description": "Apple everything",
            "logo_url": "apple.com"
        });
    await request(app)
        .post("/companies")
        .send({
            "handle": "TSL",
            "name": "Tesla",
            "num_employees": 1000,
            "description": "Tesla everything",
            "logo_url": "tesla.com"
        });
    await request(app)
        .post("/companies")
        .send({
            "handle": "AMZ",
            "name": "Amazon",
            "num_employees": 100000,
            "description": "Amazon everything",
            "logo_url": "amazon.com"
        });
});

// test post route
describe("POST /companies", () => {
    test("make new company", async function () {
        const postResults = await request(app)
            .post("/companies")
            .send({
                "handle": "GOOG",
                "name": "Google",
                "num_employees": 100,
                "description": "Google everything",
                "logo_url": "google.com"
            });
        expect(postResults.statusCode).toBe(201);
        // get /companies to check if post route worked
        const getResults = await request(app)
            .get("/companies")
        expect(getResults.statusCode).toBe(200);
        expect(getResults.body).toEqual(
            {
                "companies":
                    expect.arrayContaining([
                        expect.objectContaining({
                            "name": "Google"
                        })
                    ])
            }
        )
    })
})

// test get route and query string filters
describe("GET /companies", () => {
    test("get all companies", async function () {
        const results = await request(app)
            .get("/companies")
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual(
            {
                "companies": [
                    {
                        "handle": "MS",
                        "name": "Microsoft",
                        "num_employees": 10000,
                        "description": "Microsoft everything",
                        "logo_url": "microsoft.com"
                    },
                    {
                        "handle": "APL",
                        "name": "Apple",
                        "num_employees": 10000,
                        "description": "Apple everything",
                        "logo_url": "apple.com"
                    },
                    {
                        "handle": "TSL",
                        "name": "Tesla",
                        "num_employees": 1000,
                        "description": "Tesla everything",
                        "logo_url": "tesla.com"
                    },
                    {
                        "handle": "AMZ",
                        "name": "Amazon",
                        "num_employees": 100000,
                        "description": "Amazon everything",
                        "logo_url": "amazon.com"
                    },
                    {
                        "handle": "GOOG",
                        "name": "Google",
                        "num_employees": 100,
                        "description": "Google everything",
                        "logo_url": "google.com"
                    }
                ]
            });
    });

    test("get all companies that match query string 'search'",
        async function () {
            const results = await request(app)
                .get("/companies?search=m")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "companies": [
                        {
                            "handle": "MS",
                            "name": "Microsoft",
                            "num_employees": 10000,
                            "description": "Microsoft everything",
                            "logo_url": "microsoft.com"
                        },
                        {
                            "handle": "AMZ",
                            "name": "Amazon",
                            "num_employees": 100000,
                            "description": "Amazon everything",
                            "logo_url": "amazon.com"
                        }
                    ]
                });
        });

    test("get all companies that >= query string 'min_employees'",
        async function () {
            const results = await request(app)
                .get("/companies?min_employees=10000")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "companies": [
                        {
                            "handle": "MS",
                            "name": "Microsoft",
                            "num_employees": 10000,
                            "description": "Microsoft everything",
                            "logo_url": "microsoft.com"
                        },
                        {
                            "handle": "APL",
                            "name": "Apple",
                            "num_employees": 10000,
                            "description": "Apple everything",
                            "logo_url": "apple.com"
                        },
                        {
                            "handle": "AMZ",
                            "name": "Amazon",
                            "num_employees": 100000,
                            "description": "Amazon everything",
                            "logo_url": "amazon.com"
                        }
                    ]
                });
        });

    test("get all companies that <= query string 'max_employees'",
        async function () {
            const results = await request(app)
                .get("/companies?max_employees=1000")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "companies": [
                        {
                            "handle": "TSL",
                            "name": "Tesla",
                            "num_employees": 1000,
                            "description": "Tesla everything",
                            "logo_url": "tesla.com"
                        },
                        {
                            "handle": "GOOG",
                            "name": "Google",
                            "num_employees": 100,
                            "description": "Google everything",
                            "logo_url": "google.com"
                        }
                    ]
                });
        });
});

// test to get single company from handle
describe("GET /companies/:handle", () => {
    test("get company thats handle is passed in the params",
        async function () {
            const results = await request(app)
                .get("/companies/goog")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "company":
                    {
                        "handle": "GOOG",
                        "name": "Google",
                        "num_employees": 100,
                        "description": "Google everything",
                        "logo_url": "google.com"
                    }
                });
        });
});

// test route to patch company
describe("PATCH /companies/:handle", () => {
    test("patch company thats handle is passed in the params",
        async function () {
            const patchResults = await request(app)
                .patch("/companies/goog")
                .send({
                    "description": "Updated Description"
                });
            expect(patchResults.statusCode).toBe(200);
            expect(patchResults.body).toEqual(
                {
                    "company":
                    {
                        "handle": "GOOG",
                        "name": "Google",
                        "num_employees": 100,
                        "description": "Updated Description",
                        "logo_url": "google.com"
                    }
                });
            const getResults = await request(app)
                .get("/companies/goog")
            expect(getResults.statusCode).toBe(200);
            expect(getResults.body).toEqual(
                {
                    "company":
                    {
                        "handle": "GOOG",
                        "name": "Google",
                        "num_employees": 100,
                        "description": "Updated Description",
                        "logo_url": "google.com"
                    }
                });
        });
});

// test route to delete company
describe("DELETE /companies/:handle", () => {
    test("delete company thats handle is passed in the params",
        async function () {
            const deleteResults = await request(app)
                .delete("/companies/goog")
            expect(deleteResults.statusCode).toBe(200);
            expect(deleteResults.body).toEqual(
                {
                    "message": "Company deleted"
                });
            const getResults = await request(app)
                .get("/companies/goog")
            expect(getResults.statusCode).toBe(404);
            expect(getResults.body).toEqual(
                {
                    "status": 404,
                    "message": "handle: \"goog\" doesn't exist"
                });
        });
});