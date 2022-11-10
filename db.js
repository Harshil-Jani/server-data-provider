const Pool = require("pg").Pool;
/*
    In a nutshell, the Connection pool is similar to a cache where we store frequently 
    accessed data. Here the data is a database connection. The goal is to achieve the 
    reusability of the database connections instead of creating a new connection every time 
    there is a demand for the data.
*/

const pool = new Pool({
    user: "postgres",
    password: "bunny",
    host: "localhost",
    port: 5432,
    database: "pernkeep"
});

module.exports = pool;