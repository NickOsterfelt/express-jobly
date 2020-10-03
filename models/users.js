/**
 * The User model contains functions for finding,
 * creating, updating, and deleting users. 
 * In addition, it provides the authenticate function
 * which uses bcrypt to verify that a username and password
 * are valid pairs.
 */

const bcrypt = require("bcrypt")

const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

const BCRYPT_WORK_FACTOR = 12;

class User {
    //find a user with matching username
    static async findOne(username) {
        const result = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
                FROM users
                WHERE username=$1`, [username]
        );

        if(result.rows.length === 0){
            throw new ExpressError("No user was found", 404);
        }

        return result.rows[0];
    }

    //get all users
    static async findAll(data) {
        const result = await db.query(
            `SELECT username, first_name, last_name, email
                FROM users`
        );
        return result.rows;
    }
    //create a user with values in data
    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR)

        const result = await db.query(
            `INSERT INTO users(
                username,
                password,
                first_name,
                last_name,
                email,
                photo_url)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING username, password, first_name, last_name, email, photo_url`,
                [data.username,
                hashedPassword,
                data.first_name,
                data.last_name,
                data.email,
                data.photo_url]
        );
        return result.rows[0];
    }
    //update a user with given username, and values in data
    static async update(data, username) {
        try{
            Object.keys(data);
        }catch(e){
            throw new ExpressError("invalid request data for updating user", 400);
        }
        //updates password if a new password is specified. Potential security issue?
        if("password" in Object.keys(data)){
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }
        
        const {query, values} = sqlForPartialUpdate("users", data, "username", username);

        const result = await db.query(query, values);

        return result.rows[0];
    }
    //deletes a user with matching id
    static async delete(id) {
        const result = await db.query(
            "DELETE FROM users WHERE username=$1 RETURNING username", [id]
        );
        if(result.rows.length === 0) {
            throw new ExpressError("User not found", 404);
        }
        
        return {msg: "User deleted"};
    }
    //uses bcrypt to determine if hashed provided password 
    // and the stored hashed password are matching pairs, for
    //the provided user.
    static async authenticate(username, password){
        const result = await db.query(`
        SELECT * FROM users WHERE username = $1`,
        [username]);

        const user = result.rows[0];

        if(!user) {
            throw new ExpressError("User not found", 404);
        }

        const valid = await bcrypt.compare(password, user.password);
        //may want to provide same feedback for wrong username and wrong password
        //to provide more security.
        if(valid){
            return user;
        }
        else {
            throw new ExpressError("Password incorrect", 401);
        }
    }
}

module.exports = User;