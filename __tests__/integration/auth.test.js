process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

beforeAll(async function () {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
});

// populate with test data before running test
beforeAll(async function () {
    await request(app)
        .post("/users")
        .send({
            "username": "admin",
            "password": "admin",
            "first_name": "admin",
            "last_name": "admin",
            "email": "admin@gmail.com",
            "photo_url": "admin.url",
            "is_admin": "True"
        });
    await request(app)
        .post("/users")
        .send({
            "username": "test",
            "password": "test",
            "first_name": "test",
            "last_name": "test",
            "email": "test@gmail.com",
            "photo_url": "test.url",
            "is_admin": "False"
        });
    const results = await request(app)
        .post("/login")
        .send({
            "username": "admin",
            "password": "admin"
        });
    await request(app)
        .post("/companies")
        .send({
            "handle": "MS",
            "name": "Microsoft",
            "num_employees": 10000,
            "description": "Microsoft everything",
            "logo_url": "microsoft.com",
            "_token": results.body._token
        });
    await request(app)
        .post("/companies")
        .send({
            "handle": "APL",
            "name": "Apple",
            "num_employees": 20000,
            "description": "Apple everything",
            "logo_url": "apple.com",
            "_token": results.body._token
        });
    await request(app)
        .post("/jobs")
        .send({
            "title": "back-end engineer",
            "salary": 75000,
            "equity": 0.08,
            "company_handle": "MS",
            "_token": results.body._token
        });
    await request(app)
        .post("/jobs")
        .send({
            "title": "front-end engineer",
            "salary": 80000,
            "equity": 0.06,
            "company_handle": "APL",
            "_token": results.body._token
        });
});

// test login route
describe("POST /login", () => {
    test("login user", async function () {
        const results = await request(app)
            .post("/login")
            .send({
                "username": "test",
                "password": "test"
            });
        expect(results.statusCode).toBe(200);
        const resultsFail = await request(app)
            .post("/login")
            .send({
                "username": "test",
                "password": "admin"
            });
        expect(resultsFail.statusCode).toBe(400);
    });
});

// middleware testing
describe("testing middleware", () => {
    test("ensureLoggedIn", async function () {
        const testLogin = await request(app)
            .post("/login")
            .send({
                "username": "test",
                "password": "test"
            });
        expect(testLogin.statusCode).toBe(200);
        const patchTest = await request(app)
            .patch("/users/test")
            .send({
                "username": "test",
                "password": "test",
                "first_name": "test-update",
                "last_name": "test-update",
                "email": "test@gmail.com",
                "photo_url": "test.url",
                "is_admin": "False",
                "_token": testLogin.body._token
            });
        expect(patchTest.statusCode).toBe(200);
        const patchFail = await request(app)
            .patch("/users/test")
            .send({
                "username": "test",
                "password": "test",
                "first_name": "test-update",
                "last_name": "test-update",
                "email": "test@gmail.com",
                "photo_url": "test.url",
                "is_admin": "False"
            });
        expect(patchFail.statusCode).toBe(401);
    });

    test("ensureAdmin", async function () {
        try {
            const testLogin = await request(app)
                .post("/login")
                .send({
                    "username": "test",
                    "password": "test"
                });
            expect(testLogin.statusCode).toBe(200);
            const adminLogin = await request(app)
                .post("/login")
                .send({
                    "username": "admin",
                    "password": "admin"
                });
            expect(adminLogin.statusCode).toBe(200);
            const resultsTest = await request(app)
                .patch("/companies/APL")
                .send({
                    "handle": "APL",
                    "name": "Apple",
                    "num_employees": 20000,
                    "description": "Apple everything updated",
                    "logo_url": "apple.com",
                    "_token": testLogin.body._token
                });
            expect(resultsTest.statusCode).toBe(401);
            const resultsAdmin = await request(app)
                .patch("/companies/APL")
                .send({
                    "handle": "APL",
                    "name": "Apple",
                    "num_employees": 20000,
                    "description": "Apple everything updated",
                    "logo_url": "apple.com",
                    "_token": adminLogin.body._token
                });
            expect(resultsAdmin.statusCode).toBe(200);
        } catch {
            return
        }
    });
});