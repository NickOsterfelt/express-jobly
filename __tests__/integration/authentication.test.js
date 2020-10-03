process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require("../../app");
const db = require("../../db");
const {setupTestData} = require("../../__tests__/integration/testconfig");

beforeAll(async function(){
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs;")
    await db.query("DELETE FROM users");
});

beforeEach(async function() {
    await setupTestData();
});
//tests login route
describe('POST /login', function(){
    test("Should return a JWT when provided valid login", async function(){
        const response = await request(app).post('/login').send({username: "user", password: "password"});
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
    });
    test("Should reject bad user input", async function(){
        let response= await request(app).post('/login').send({username: "invalid", password: "password"});
        expect(response.status).toBe(404);
        response = await request(app).post('/login').send({username: "user", password: "notpassword"});
        expect(response.status).toBe(401);
    });
});

afterEach(async function(){
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM users");
});

afterAll(async function(){
    await db.end();
});