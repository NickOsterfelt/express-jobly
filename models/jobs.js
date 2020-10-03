/**
 * The job model provides useful functions for 
 * finding, creating, updating, and deleting jobs.
 */
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

class Job {
    //get one job with specified id
    static async findOne(id) {
        const result = await db.query(
            `SELECT * 
                FROM jobs
                WHERE id=$1`, [id]
        );

        if(result.rows.length === 0){
            throw new ExpressError("No jobs were found", 404);
        }

        return result.rows[0];
    }
    //get all jobs. data contains optional query filtering.
    static async findAll(data) {
        let query = "SELECT id, title, company_handle FROM jobs";
        let filters = [];
        let values = [];
        
        if(data){
            //add WHERE clause if query parameters exist
            if(Object.keys(data).length > 0) {
                query += " WHERE ";
            }
        }else {
            data = {};
        }

        for(let key of Object.keys(data)){
            let filter = "";
            //if multiple query parameters, add AND clause
            if( filters.length > 0){
                filter+= "AND "
            }
            if(key === "min_salary"){
                filter+= `salary >= $${filters.length+1} `
            }
            if(key === "min_equity"){
                filter+= `equity >= $${filters.length+1} `
            }
            if(key === "search"){
                filter += `title ILIKE $${filters.length+1}`
            }
            if(key !== "min_salary" && key !== "min_equity" && key !== "search"){
                throw new ExpressError(`Could not process query string key ${key}`, 400);
            }
            values.push(data[key]);
            filters.push(filter)
        }

        query += filters.join("") + " ORDER BY date_posted"

        const results = await db.query(
            query, values
        );

        return results.rows;
    }
    //creates a new job
    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [data.title,
                data.salary,
                data.equity,
                data.company_handle]
        );
        return result.rows[0];
    }
    //updates a job with matching id, and values in data
    static async update(data, id) {
        try{
            Object.keys(data);
        }catch(e){
            throw new ExpressError("invalid request data for updating job", 400);
        }
        const {query, values} = await sqlForPartialUpdate("jobs", data, "id", id);
        const result = await db.query(query, values);

        return result.rows[0];
    }
    //deletes a job with matching id
    static async delete(id) {
        const result = await db.query(
            "DELETE FROM jobs WHERE id=$1 RETURNING id", [id]
        );
        if(result.rows.length === 0) {
            throw new ExpressError("Job not found", 404);
        }
        
        return {msg: "Job deleted"};
    }
}

module.exports = Job;