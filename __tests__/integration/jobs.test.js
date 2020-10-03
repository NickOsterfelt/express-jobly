
process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require("../../app");
const db = require("../../db");
const {setupTestData, testData} = require("../integration/testconfig")
beforeAll(async function(){
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
});

beforeEach(async function() {
    await setupTestData();
});

describe('GET / jobs', function() {
    test("Should get all jobs when no query provided", async function(){
        const response = await request(app).get('/jobs').send({ _token : testData.userJWT });
        expect(response.body.jobs.length).toBe(2);
        expect(response.body.jobs[0].title).toBe("job1")
    });
    
    test("Should have working search and filtering with query strings", async function(){
        let response = await request(app).get('/jobs').query({"search" : "job1"}).send({ _token : testData.userJWT });
        expect(response.body.jobs[0].title).toBe("job1");
        expect(response.body.jobs.length).toBe(1);

        response = await request(app).get("/jobs").query({"min_salary" : 100}).send({ _token : testData.userJWT })
        expect(response.body.jobs.length).toBe(2);
        
        response = await request(app).get("/jobs").query({"min_equity" : 0.2}).send({ _token : testData.userJWT });
        expect(response.body.jobs.length).toBe(1);
    });

    test("Should reject bad query parameters", async function(){
        let response = await request(app).get("/jobs").query({"asdfa" : 1000}).send({ _token : testData.userJWT });
        expect(response.statusCode).toBe(400)
    });
});

describe('GET /:id job', function(){
    test("Should get a specific job with the matching handle", async function(){
        const job = await db.query("SELECT id FROM jobs WHERE title='job1'");
        const response = await request(app).get(`/jobs/${job.rows[0].id}`).send({ _token : testData.userJWT });
        expect(response.body.job.title).toBe("job1");
        expect(response.body.job.company_handle).toBe("c1")
    });
});

describe('POST / job', function(){
    test("Should add a new job to the db", async function(){
        testData.sampleJob1._token = testData.adminJWT;
        const response = await request(app).post('/jobs').send(testData.sampleJob1);
        expect(response.statusCode).toBe(201);
        expect(response.body.job).toHaveProperty('date_posted');
    });

    test("Should reject bad salary and equity", async function(){
        testData.badJobSalary._token = testData.adminJWT;
        testData.badJobEquity._token = testData.adminJWT;
        let response = await request(app).post('/jobs').send(testData.badJobSalary);
        expect(response.statusCode).toBe(400);

        response = await request(app).post("/jobs").send(testData.badJobEquity);
        expect(response.statusCode).toBe(400);
    });
});

describe('PATCH /:id job', function(){
    test("Should update a single job", async function(){
        const job = await db.query("SELECT id FROM jobs WHERE title='job1'");

        const response = await request(app).patch(`/jobs/${job.rows[0].id}`).send({title: "updated", _token : testData.adminJWT});
        expect(response.body.job.title).not.toBe("job1");
        expect(response.body.job.title).toBe("updated")
    })
})

describe("DELETE /:id job", function(){
    test("Should delete a single job", async function(){
        const job = await db.query("SELECT id FROM jobs WHERE title='job1'");
        const response = await request(app).delete(`/jobs/${job.rows[0].id}`).send({ _token : testData.adminJWT });
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe("Job deleted");
    })
})

afterEach(async function(){
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");
});

afterAll(async function(){
    await db.end();
});