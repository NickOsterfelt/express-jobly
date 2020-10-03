/** Database setup for jobly. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const db = new Client({
  connectionString: `postgresql://postgres:password@localhost/${DB_URI}`
});

db.connect();

module.exports = db;
