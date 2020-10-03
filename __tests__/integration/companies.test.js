
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require("../../app");
const db = require("../../db");
const { setupTestData, testData } = require('./testconfig');

beforeAll(async function(){
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs;");
    await db.query("DELETE FROM users");
});

beforeEach(async function() {
    await setupTestData();
});

describe('GET / companies', function() {
    test("Should get all companies when no query provided", async function(){
        const response = await request(app).get('/companies').send({_token: testData.userJWT});
        expect(response.body.companies.length).toBe(2);
        expect(response.body.companies[0].name).toBe("company1")
    });

    test("Should have working search and filtering with query strings", async function(){
        let response = await request(app).get('/companies').query({"search" : "company1"}).send({_token: testData.userJWT});
        expect(response.body.companies[0].name).toBe("company1");
        expect(response.body.companies.length).toBe(1);

    response = await request(app).get("/companies").query({"min_employees" : 1000}).send({_token: testData.userJWT});
        expect(response.body.companies.length).toBe(2);
        
        response = await request(app).get("/companies").query({"max_employees" : 1000}).send({_token: testData.userJWT});
        expect(response.body.companies.length).toBe(1);
    });

    test("Should reject bad query parameters", async function(){
        let response = await request(app).get("/companies").query({"min_employees" : 1000, "max_employees": 50}).send({_token: testData.userJWT})
        expect(response.statusCode).toBe(400);
        
        response = await request(app).get("/companies").query({"asdfa" : 1000}).send({_token: testData.userJWT});
        expect(response.statusCode).toBe(400)
    });
});

describe('GET /:handle company', function(){
    test("Should get a specific company with the matching handle", async function(){
        const response = await request(app).get('/companies/c1').send({_token: testData.userJWT});
        expect(response.body.company.name).toBe("company1");
    });

    test("Should get a list of jobs with the company's handle", async function(){

        const response = await request(app).get('/companies/c1').send({_token: testData.userJWT});
        expect(response.body.company.jobs).toHaveLength(1);
    })
    
});

describe('POST / company', function(){
    test("Should add a new company to the db", async function(){
        testData.sampleCompany1._token = testData.adminJWT;
        const response = await request(app).post('/companies').send(testData.sampleCompany1);
        expect(response.statusCode).toBe(201);
        expect(response.body.company).toHaveProperty('handle');
    });

    test("Should reject invalid json before reaching db", async function(){
        testData.badCompany1._token = testData.adminJWT;
        const response = await request(app).post("/companies").send(testData.badCompany1);
        expect(response.statusCode).toBe(400);
    });

    test("Should reject duplicate handles", async function(){
        testData.sampleCompany1._token = testData.adminJWT;
        await request(app).post('/companies').send(testData.sampleCompany1);
        const response = await request(app).post('/companies').send(testData.sampleCompany1);
        expect(response.statusCode).toBe(500);
    });
});

describe('PATCH /:handle company', function(){
    test("Should update a single company", async function(){
        const response = await request(app).patch(`/companies/c1`).send({
            "name" : "testupdate",
            _token : testData.adminJWT
        });
        expect(response.body.company.name).not.toBe("company1");
        expect(response.body.company.name).toBe("testupdate")
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