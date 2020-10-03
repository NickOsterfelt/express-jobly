/**
 * jobs routes define the routes to access jobs resources.
 */
const express = require("express");
const Job = require("../models/jobs");
const validateJSON = require("../middleware/validateJSON");
const {ensureAuthenticated, ensureCurrentUser} = require("../middleware/authentication");


const router = new express.Router();
//gets all jobs, requires user is authenticated, and can accept query parameters.
router.get('/', ensureAuthenticated(), async function(req, res, next){
    try{
        const jobs = await Job.findAll(req.query)
        return res.json({jobs});
    }
    catch (e) {
        return next(e);
    }
});
//gets a job with specified id. requires user authentication.
router.get('/:id', ensureAuthenticated(), async function(req, res, next){
    try{
        const job = await Job.findOne(req.params.id);
        return res.json({job});
    }
    catch (e) {
        return next(e);
    }
});
//creates a new job. requires admin authentication and valid json of a job.
router.post('/', [ensureAuthenticated(true), validateJSON("job_new")], async function(req, res, next){
    try{
        let job = await Job.create(req.body)
        return res.status(201).json({job});
    }
    catch (e) {
        return next(e);
    }
});
//updates an existing job. requires admin authentication and valid json of job fields.
router.patch('/:id', [ensureAuthenticated(true), validateJSON("job_update")], async function(req, res, next){
    try{
        let job = await Job.update(req.body, req.params.id);
        return res.json({job});
    }
    catch (e) {
        return next(e);
    }
});

router.delete('/:id', ensureAuthenticated(true), async function(req, res, next){
    try{
        return res.json(await Job.delete(req.params.id));  
    }
    catch (e) {
        return next(e);
    }
});
module.exports = router;