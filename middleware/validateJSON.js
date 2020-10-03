/**
 * validateJSON function handles json validation for each 
 * function. The schema map takes the schemaType parameter 
 * to determine which json schema to use. 
 */

const jsonSchema = require("jsonschema");
const companySchemaNew = require("../schemas/companyNew.json");
const companySchemaUpdate = require("../schemas/companyUpdate.json");
const jobSchemaNew = require("../schemas/jobNew.json");
const jobSchemaUpdate = require("../schemas/jobUpdate.json");
const userSchemaNew = require("../schemas/userNew.json");
const userSchemaUpdate = require("../schemas/userUpdate.json");
const ExpressError = require("../helpers/expressError");

const schemaMap = {
    "company_new" : companySchemaNew,
    "company_update" : companySchemaUpdate,
    "job_new" : jobSchemaNew,
    "job_update": jobSchemaUpdate,
    "user_new" : userSchemaNew,
    "user_update" : userSchemaUpdate
}

function validateJSON(schemaType){
    return async (req, res, next) => {
        try{
            let valid = await jsonSchema.validate(req.body, schemaMap[schemaType]);

            if(valid.errors.length !== 0){
                throw new ExpressError(valid.errors.map(e => e.stack), 400);
            }
            return next();
        }
        catch (e) {
            return next(e);
        }
    }   
}

module.exports = validateJSON;

   