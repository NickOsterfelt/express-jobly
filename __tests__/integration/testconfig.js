process.env.NODE_ENV = "test";

const request = require('supertest');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const app = require("../../app");
const db = require("../../db");

const User = require('../../models/users');
const testData = {};

//adds useful testdata to testData object.
async function setupTestData() {
    try {
        //User test data
        testData.password = await bcrypt.hash("password", 5);
        await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
        VALUES
        ('user', '${testData.password}', 'userfname', 'userlname', 'email1@email.com', false),
        ('admin', '${testData.password}', 'adminfname', 'adminlname', 'email2@email.com', true)`
        );
        testData.sampleUser1 = { "username": "sampleuser1", "password": "password", "first_name": "firstName", "last_name": "last_name", "email": "sample1@email.com" };
        testData.badUser1 = { "username": "", "password": "", "first_name": "firstName", "last_name": "last_name" }
        //jwt
        let response = await request(app).post('/login').send({username: "user", password:"password"});
        testData.userJWT = response.body.token;

        response = await request(app).post('/login').send({username: "admin", password: "password"});
        testData.adminJWT = response.body.token;

        //Company test data
        await db.query('INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3) RETURNING *',
            ['c1', 'company1', 1000]);
        await db.query('INSERT INTO companies (handle, name, num_employees) VALUES ($1, $2, $3) RETURNING *',
            ['c2', 'company2', 2000]);
        testData.sampleCompany1 = { "handle": "s1", "name": "sample1", "num_employees": 10 };
        testData.badCompany1 = { "handle": "bad" }

        //Jobs test data
        await db.query('INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)',
            ['job1', 100.00, 0.1, "c1"]);
        await db.query('INSERT INTO jobs (title, salary, equity, company_handle) VALUES ($1, $2, $3, $4)',
            ['job2', 200.00, 0.2, "c2"]);
        testData.sampleJob1 = { "title": "sample1", "salary": 10, "equity": 0.05, "company_handle": "c1" };
        testData.badJobSalary = { "title": "bad1", "salary": -10, "equity": 0.05, "company_handle": "c1" };
        testData.badJobEquity = { "title": "bad2", "salary": 10, "equity": 25, "company_handle": "c1" };
    }
    catch(e){
        console.error(e);
    }
}

module.exports = { setupTestData, testData };