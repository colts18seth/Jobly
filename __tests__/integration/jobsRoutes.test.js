process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

// clear database before runing test
beforeAll(async function () {
    await db.query("DELETE FROM jobs");
})

// populate with simple data before running test
beforeAll(async function () {
    await request(app)
        .post("/jobs")
        .send({
            "title": "back-end engineer",
            "salary": 75000,
            "equity": 0.08,
            "company_handle": "TSL"
        });
    await request(app)
        .post("/jobs")
        .send({
            "title": "back-end engineer",
            "salary": 75000,
            "equity": 0.08,
            "company_handle": "GOOG"
        });
    await request(app)
        .post("/jobs")
        .send({
            "title": "front-end engineer",
            "salary": 75000,
            "equity": 0.08,
            "company_handle": "TSL"
        });
});

// test post route
describe("POST /jobs", () => {
    test("make new job", async function () {
        const postResults = await request(app)
            .post("/jobs")
            .send({
                "title": "software engineer",
                "salary": 100000,
                "equity": 0.12,
                "company_handle": "TSL"
            });
        expect(postResults.statusCode).toBe(201);
        // get /jobs to check if post route worked
        const getResults = await request(app)
            .get("/jobs")
        expect(getResults.statusCode).toBe(200);
        expect(getResults.body).toEqual(
            {
                "jobs":
                    expect.arrayContaining([
                        expect.objectContaining({
                            "title": "software engineer"
                        })
                    ])
            }
        )
    })
})

//test get route and query string filters
describe("GET /jobs", () => {
    test("get all jobs", async function () {
        const results = await request(app)
            .get("/jobs")
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual(
            {
                "jobs":
                    expect.arrayContaining([
                        expect.objectContaining({
                            "company_handle": "TSL",
                            "equity": "0.08",
                            "salary": "75000",
                            "title": "back-end engineer",
                        }),
                        expect.objectContaining({
                            "company_handle": "TSL",
                            "equity": "0.08",
                            "salary": "75000",
                            "title": "front-end engineer"
                        }),
                        expect.objectContaining({
                            "company_handle": "TSL",
                            "equity": "0.12",
                            "salary": "100000",
                            "title": "software engineer"
                        })
                    ])
            });
    });

    test("get all jobs that match query string 'search'",
        async function () {
            const results = await request(app)
                .get("/jobs?search=t")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "jobs": [{
                        "title": "front-end engineer",
                        "company_handle": "TSL"
                    },
                    {
                        "title": "software engineer",
                        "company_handle": "TSL"
                    }]
                });
        });

    test("get all jobs that >= query string 'min_salary'",
        async function () {
            const results = await request(app)
                .get("/jobs?min_salary=80000")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "jobs": [
                        {
                            "title": "software engineer",
                            "company_handle": "TSL"
                        }
                    ]
                });
        });

    test("get all jobs that >= query string 'min_equity'",
        async function () {
            const results = await request(app)
                .get("/jobs?min_equity=0.1")
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual(
                {
                    "jobs": [
                        {
                            "title": "software engineer",
                            "company_handle": "TSL"
                        }
                    ]
                });
        });
});

// test to get single job from id
describe("GET /jobs/:id", () => {
    test("get job thats id is passed in the params",
        async function () {
            const getResults = await db.query(
                `SELECT id, title, salary, equity, company_handle, date_posted
                FROM jobs
                LIMIT 1`
            );
            const id = getResults.rows[0].id;
            const results = await request(app)
                .get(`/jobs/${id}`)
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual({
                "job": {
                    "id": expect.any(Number),
                    "title": 'back-end engineer',
                    "salary": '75000',
                    "equity": '0.08',
                    "company_handle": 'TSL',
                    "date_posted": expect.anything()
                }
            });
        });
});

// test route to patch company
describe("PATCH /jobs/:id", () => {
    test("patch job thats id is passed in the params",
        async function () {
            const getOneResult = await db.query(
                `SELECT id, title, salary, equity, company_handle, date_posted
                FROM jobs
                LIMIT 1`
            );
            const id = getOneResult.rows[0].id;
            const patchResults = await request(app)
                .patch(`/jobs/${id}`)
                .send({
                    "title": 'back-end engineer',
                    "salary": 80000,
                    "equity": 0.08,
                    "company_handle": 'TSL'
                });
            expect(patchResults.statusCode).toBe(200);
            expect(patchResults.body).toEqual(
                {
                    "job": {
                        "id": expect.any(Number),
                        "title": 'back-end engineer',
                        "salary": '80000',
                        "equity": '0.08',
                        "company_handle": 'TSL',
                        "date_posted": expect.anything()
                    }
                });
            const getResults = await request(app)
                .get(`/jobs/${id}`)
            expect(getResults.statusCode).toBe(200);
            expect(getResults.body).toEqual(
                {
                    "job": {
                        "id": expect.any(Number),
                        "title": 'back-end engineer',
                        "salary": '80000',
                        "equity": '0.08',
                        "company_handle": 'TSL',
                        "date_posted": expect.anything()
                    }
                });
        });
});

// test route to delete company
describe("DELETE /jobs/:id", () => {
    test("delete job thats id is passed in the params",
        async function () {
            const getOneResult = await db.query(
                `SELECT id, title, salary, equity, company_handle, date_posted
                FROM jobs
                LIMIT 1`
            );
            const id = getOneResult.rows[0].id;
            const deleteResults = await request(app)
                .delete(`/jobs/${id}`)
            expect(deleteResults.statusCode).toBe(200);
            expect(deleteResults.body).toEqual(
                {
                    "message": "Job deleted"
                });
            const getResults = await request(app)
                .get(`/jobs/${id}`)
            expect(getResults.statusCode).toBe(404);
            expect(getResults.body).toEqual(
                {
                    "status": 404,
                    "message": `id: \"${id}\" doesn't exist`
                });
        });
});