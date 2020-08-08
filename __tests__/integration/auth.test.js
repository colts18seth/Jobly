process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

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
            "is_admin": "False"
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
            "username": "admin",
            "password": "admin",
            "first_name": "admin",
            "last_name": "admin",
            "email": "admin.com",
            "photo_url": "admin.url",
            "is_admin": "True"
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