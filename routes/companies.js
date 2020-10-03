/**
 * companies routes define the accessible routes to access company
 * resources.
 */
const express = require("express");
const Company = require("../models/companies");
const validateJSON = require("../middleware/validateJSON")
const {ensureAuthenticated, ensureCurrentUser} = require("../middleware/authentication");

const router = new express.Router();

//gets all companies with optional query parameters. Requires that the user
//is authenticated
router.get('/', ensureAuthenticated(), async function(req, res, next){
    try{
        const companies = await Company.findAll(req.query)
        return res.json({companies});
    }
    catch (e) {
        return next(e);
    }
});
//Gets a given company with specified handle
router.get('/:handle', ensureAuthenticated(), async function(req, res, next){
    try{
        const company = await Company.findOne(req.params.handle);
        return res.json({company});
    }
    catch (e) {
        return next(e);
    }
});
//accepts a post request to create a new company. Requires that an 
//admin is authenticated, and that the json in the request is a valid
//company
router.post('/',  [ensureAuthenticated(true), validateJSON("company_new")], async function(req, res, next){
    try{
        let company = await Company.create(req.body)
        return res.status(201).json({company});
    }
    catch (e) {
        return next(e);
    }
});
//accepts a patch request to update a company. Requires that an 
//admin is authenticated, and that the json in the request contains
// valid company fields to update
router.patch('/:handle', [ensureAuthenticated(true), validateJSON("company_update")], async function(req, res, next){
    try{
        let company = await Company.update(req.body, req.params.handle);
        return res.json({company});
    }
    catch (e) {
        return next(e);
    }
});
//accepts a delete request to delete a company. requires that an 
//admin is authenticated.
router.delete('/:handle', ensureAuthenticated(true), async function(req, res, next){
    try{
        return await Company.remove(req.params.handle);  
    }
    catch (e) {
        return next(e);
    }
});
module.exports = router;