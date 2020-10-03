
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require("../../app");
const db = require("../../db");
const { setupTestData, testData } = require('./testconfig');

const valid_data = {"username": "valid", "password" : "password", "first_name": "firstName", "last_name":"last_name", "email": "email@email.com"};
let jwt

beforeAll(async function(){
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
})

beforeEach(async function() {
    await setupTestData();
});

describe('GET / users', function() {
    test("Should get all users", async function(){
        const response = await request(app).get('/users').send({_token : testData.userJWT});
        expect(response.body.users.length).toBe(2);
        expect(response.body.users[0].username).toBe("user")
    });
});

describe('GET /username user', function(){
    test("Should get a specific user with the matching username", async function(){
        const response = await request(app).get(`/users/user`).send({_token : testData.userJWT});
        expect(response.body.user.first_name).toBe("userfname");
    });
});

describe('POST / user', function(){
    test("Should create a new user and return a JWT when provided valid new user input", async function(){
        let response=await request(app).post('/users').send(testData.sampleUser1);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
    });

    test("Should reject duplicate users", async function(){
        await request(app).post('/users').send(testData.sampleUser1);
        response = await request(app).post('/users').send(testData.sampleUser1);
        expect(response.statusCode).toBe(500);
    });
});

describe('PATCH /username user', function(){
    test("Should update a single user", async function(){
        let data = {first_name: "updated", _token : testData.userJWT};
        const response = await request(app).patch(`/users/user`).send(data)
        expect(response.body.user.first_name).not.toBe("userfname");
        expect(response.body.user.first_name).toBe("updated");
    });
})

describe("DELETE /username user", function(){
    test("Should delete a single user", async function(){
        const response = await request(app).delete(`/users/user`).send({ _token: testData.userJWT });
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("User deleted");
    });
});

afterEach(async function(){
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
});

afterAll(async function(){
    await db.end();
});