process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

// clear database before runing test
beforeAll(async function () {
    await db.query("DELETE FROM users");
})

// populate with simple data before running test
beforeAll(async function () {
    await request(app)
        .post("/users")
        .send({
            "username": "colts18seth",
            "password": "password",
            "first_name": "Seth",
            "last_name": "Laf",
            "email": "colts@gmail.com",
            "photo_url": "photo.url",
            "is_admin": "True"
        });
    await request(app)
        .post("/users")
        .send({
            "username": "colts18seth2",
            "password": "password2",
            "first_name": "Seth2",
            "last_name": "Laf2",
            "email": "colts@gmail.com2",
            "photo_url": "photo.url2",
            "is_admin": "False"
        });
    await request(app)
        .post("/users")
        .send({
            "username": "colts18seth3",
            "password": "password3",
            "first_name": "Seth3",
            "last_name": "Laf3",
            "email": "colts@gmail.com3",
            "photo_url": "photo.url3",
            "is_admin": "False"
        });
});

// test post route
describe("POST /users", () => {
    test("make new user", async function () {
        const postResults = await request(app)
            .post("/users")
            .send({
                "username": "colts18seth4",
                "password": "password4",
                "first_name": "Seth4",
                "last_name": "Laf4",
                "email": "colts@gmail.com4",
                "photo_url": "photo.url4",
                "is_admin": "False"
            });
        expect(postResults.statusCode).toBe(201);
        // get /users to check if post route worked
        const getResults = await request(app)
            .get("/users")
        expect(getResults.statusCode).toBe(200);
        expect(getResults.body).toEqual(
            {
                "users":
                    expect.arrayContaining([
                        expect.objectContaining({
                            "username": "colts18seth",
                            "first_name": "Seth",
                            "last_name": "Laf",
                            "email": "colts@gmail.com"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth2",
                            "first_name": "Seth2",
                            "last_name": "Laf2",
                            "email": "colts@gmail.com2"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth3",
                            "first_name": "Seth3",
                            "last_name": "Laf3",
                            "email": "colts@gmail.com3"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth4",
                            "first_name": "Seth4",
                            "last_name": "Laf4",
                            "email": "colts@gmail.com4"
                        })
                    ])
            }
        )
    })
})

//test get route 
describe("GET /users", () => {
    test("get all users", async function () {
        const results = await request(app)
            .get("/users")
        expect(results.statusCode).toBe(200);
        expect(results.body).toEqual(
            {
                "users":
                    expect.arrayContaining([
                        expect.objectContaining({
                            "username": "colts18seth",
                            "first_name": "Seth",
                            "last_name": "Laf",
                            "email": "colts@gmail.com"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth2",
                            "first_name": "Seth2",
                            "last_name": "Laf2",
                            "email": "colts@gmail.com2"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth3",
                            "first_name": "Seth3",
                            "last_name": "Laf3",
                            "email": "colts@gmail.com3"
                        }),
                        expect.objectContaining({
                            "username": "colts18seth4",
                            "first_name": "Seth4",
                            "last_name": "Laf4",
                            "email": "colts@gmail.com4"
                        })
                    ])
            });
    });
});

// test to get single user from username
describe("GET /users/:username", () => {
    test("get user thats username is passed in the params",
        async function () {
            const getResults = await db.query(
                `SELECT username
                FROM users
                LIMIT 1`
            );
            const username = getResults.rows[0].username;
            const results = await request(app)
                .get(`/users/${username}`)
            expect(results.statusCode).toBe(200);
            expect(results.body).toEqual({
                "user": {
                    "username": "colts18seth",
                    "first_name": "Seth",
                    "last_name": "Laf",
                    "email": "colts@gmail.com",
                    "photo_url": "photo.url"
                }
            });
        });
});

// test route to patch user
describe("PATCH /user/:username", () => {
    test("patch user thats username is passed in the params",
        async function () {
            const getOneResult = await db.query(
                `SELECT username
                FROM users
                LIMIT 1`
            );
            const username = getOneResult.rows[0].username;
            const patchResults = await request(app)
                .patch(`/users/${username}`)
                .send({
                    "username": "colts18seth",
                    "password": "password1",
                    "first_name": "Seth1",
                    "last_name": "Laf1",
                    "email": "colts@gmail.com1",
                    "photo_url": "photo.url1",
                    "is_admin": "False"
                });
            expect(patchResults.statusCode).toBe(200);
            expect(patchResults.body).toEqual(
                {
                    "user": {
                        "username": "colts18seth",
                        "password": "password1",
                        "first_name": "Seth1",
                        "last_name": "Laf1",
                        "email": "colts@gmail.com1",
                        "photo_url": "photo.url1",
                        "is_admin": expect.anything()
                    }
                });
            const getResults = await request(app)
                .get(`/users/${username}`)
            expect(getResults.statusCode).toBe(200);
            expect(getResults.body).toEqual(
                {
                    "user": {
                        "username": "colts18seth",
                        "first_name": "Seth1",
                        "last_name": "Laf1",
                        "email": "colts@gmail.com1",
                        "photo_url": "photo.url1"
                    }
                });
        });
});

// test route to delete company
describe("DELETE /users/:username", () => {
    test("delete user thats username is passed in the params",
        async function () {
            const getOneResult = await db.query(
                `SELECT username
                FROM users
                LIMIT 1`
            );
            const username = getOneResult.rows[0].username;
            const deleteResults = await request(app)
                .delete(`/users/${username}`)
            expect(deleteResults.statusCode).toBe(200);
            expect(deleteResults.body).toEqual(
                {
                    "message": "User deleted"
                });
            const getResults = await request(app)
                .get(`/users/${username}`)
            expect(getResults.statusCode).toBe(404);
            expect(getResults.body).toEqual(
                {
                    "status": 404,
                    "message": `username: \"${username}\" doesn't exist`
                });
        });
});