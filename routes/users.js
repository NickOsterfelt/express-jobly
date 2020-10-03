/**
 * users routes accept requests for accessing user resources.
 */
const express = require("express");
const User = require("../models/users");
const validateJSON = require("../middleware/validateJSON");
const {ensureCurrentUser, createJWT} = require("../middleware/authentication");

const router = new express.Router();

//gets all users
router.get('/', async function(req, res, next){
    try{
        const users = await User.findAll()
        return res.json({users});
    }
    catch (e) {
        return next(e);
    }
});
//gets specified user with matching username
router.get('/:username', async function(req, res, next){
    try{
        const user = await User.findOne(req.params.username);
        return res.json({user});
    }
    catch (e) {
        return next(e);
    }
});
//creates a new user, and responds with a jwt corresponding to the new
// user. Requires valid json pertaining to a new user.
router.post('/', validateJSON("user_new"), async function(req, res, next){
    try{
        let user = await User.create(req.body)
        let token = createJWT(req.body.username, false);

        return res.status(201).json({ token });
    }
    catch (e) {
        return next(e);
    }
});
//updates an existing user. requires that the user matches the user that is being 
//updated, and that valid json to update a user is provided.
router.patch('/:username', ensureCurrentUser, validateJSON("user_update"), async function(req, res, next){
    try{
        let user = await User.update(req.body, req.params.username);
        return res.json({user});
    }
    catch (e) {
        return next(e);
    }
});
//deletes a user. requires that the user matches the user being deleted.
router.delete('/:username', ensureCurrentUser, async function(req, res, next){
    try{
        return res.json(await User.delete(req.params.username));  
    }
    catch (e) {
        return next(e);
    }
});

module.exports = router;