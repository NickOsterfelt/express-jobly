/**
 *  Authentication middleware functions
 */
const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");
const {SECRET_KEY} = require("../config")

/* 
*   ensureAuthenticated() uses json web tokens to ensure that 
*   a request is a user with a verifiable json web token. 
*       -adminRequired: parameter specifies whether the authentication
*                        requires that the user is an admin
*/
function ensureAuthenticated(adminRequired = false){
    return function(req, res, next) {
        try{ 
            //verify token
            const token = jwt.verify(req.body._token, SECRET_KEY)
            req.username = token.username;
            req.isAdmin = token.is_admin;
            //check if admin is required
            if(adminRequired){
                if(!token.is_admin){
                    return next(new ExpressError("You must be an admin to access this", 401));
                }
            }

            return next()
        }
        catch (e) {
            //if verification fails
            return next(new ExpressError("Authentication is required", 401));
        }
    }
}

/**
 *  ensureCurrentUser verifies that the resource being accessed
 *  for a given user is only accessible by the user that owns the 
 *  resource.
 * 
 */
function ensureCurrentUser(req, res, next) {
    try{ 
        const token = jwt.verify(req.body._token, SECRET_KEY);
        req.username = token.username;

        if(token.username !== req.params.username){
            throw new ExpressError("You are not authorized to access this route", 401);
        }
        
        return next()
    }
    catch (e) {
        return next(e);
    }
}

/**
 *
 * createJWT is a helper function which adds a username, 
 * and whether the user is an admin to a newly signed jwt.
 * 
 * 
 */
function createJWT(username, is_admin) {
    let payload = {
        username: username,
        is_admin: is_admin
    };

    return jwt.sign(payload, SECRET_KEY)
}

module.exports = {ensureAuthenticated, ensureCurrentUser, createJWT};
