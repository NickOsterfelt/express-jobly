/**
 * The company model provides useful functions for 
 * finding, creating, updating, and deleting companies.
 * In addition, the getJobs function returns the jobs 
 * which are associated with a given company.
 */
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

class Company {
    //Gets an array of jobs that have the handle specified
    static async getJobs(handle){
        const results = await db.query(`
            SELECT id, title, salary, equity, company_handle, date_posted
            FROM jobs
            WHERE company_handle=$1`, [handle]);
        
        const jobs = results.rows
        return jobs;
    }
    //Find a single company with the 'handle' primary key
    static async findOne(handle) {
        const result = await db.query(
            `SELECT * 
                FROM companies
                WHERE handle=$1`, [handle]
        );
        
        if(result.rows.length === 0){
            throw new ExpressError("No company was found", 404);
        }
        //Get jobs and append to found company.
        const jobs = await Company.getJobs(handle)
        const company = result.rows[0]

        company.jobs = jobs;
        return company;
    }
    //Get all companies. Data is optional parameter which takes query 
    // filter options. 
    static async findAll(data) {
        let query = "SELECT handle, name FROM companies";
        let filters = [];
        let values = [];
        let min_employees;
        let max_employees;

        //if query string exists
        if(data){  
            //add WHERE cluase
            if(Object.keys(data).length > 0) {
                query += " WHERE ";
            }
        }
        else {
            data = {};
        }

        for(let key of Object.keys(data)){
            let filter = "";
            if( filters.length > 0){
                //add AND cluase if more than 1 filter
                filter+= "AND "
            }
            //filters.length +1 because can't start at $0
            if(key === "min_employees"){
                filter+= `num_employees >= $${filters.length+1} `;
                min_employees = Number(data["min_employees"])
            }
            if(key === "max_employees"){
                filter+= `num_employees <= $${filters.length+1} `;
                max_employees = Number(data["max_employees"])
            }
            if(key === "search"){
                filter += `name ILIKE $${filters.length+1} `;
            }
            if(key !== "min_employees" && key !== "max_employees" && key !== "search"){
                throw new ExpressError(`Could not process query string key ${key}`, 400);
            }
            
            values.push(data[key]);
            filters.push(filter)
        }
        //checks conflicting min/max
        if (min_employees && max_employees){
            if (max_employees < min_employees){
                throw new ExpressError(`Conflicting min and max employees`, 400);
            }
        }
        //need order by
        query += filters.join("") + " ORDER BY name"

        const results = await db.query(
            query, values
        );

        return results.rows;
    }
    //adds a new company to the DB. auth, and validation are handled further up
    static async create(data) {
        const result = await db.query(
            `INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [data.handle,
                data.name,
                data.num_employees,
                data.description, 
                data.logo_url]
        );
        return result.rows[0];
    }
    //updates a given company that has a matching handle.
    //data is the columns to be updated and matching values.
    static async update(data, handle) {
        try{
            Object.keys(data);
        }catch(e){
            throw new ExpressError("invalid request data for updating company", 400);
        }
        //use of partial update function
        const {query, values} = sqlForPartialUpdate("companies", data, "handle", handle);

        const result = await db.query(query, values);

        return result.rows[0];
    }  
    
    //delete a company that has the matching handle
    static async delete(handle) {
        const result = await db.query(
            "DELETE FROM companies WHERE handle=$1 RETURNING name", [handle]
        );
        if(result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }
        
        return {msg: "Company deleted"};
    }
}

module.exports = Company;