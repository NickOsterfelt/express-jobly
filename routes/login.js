const express = require("express");
const User = require("../models/users");
const ExpressError = require("../helpers/expressError");

const { createJWT } = require("../middleware/authentication");

const router = new express.Router();
//accepts a post request to /login.
//authenticates the user credentials, and then provides a jwt
// for the given user.
router.post("/login", async function(req, res, next) {
    try {
        const user = await User.authenticate(req.body.username, req.body.password);
        const token = createJWT(user.username, user.is_admin);

        return res.json({ token });
    }
    catch (e) {
        return next(e)
    }
});

module.exports = router;