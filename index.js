const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
/* 
    Middleware is software that provides common services and capabilities to applications 
    outside of what’s offered by the operating system. 
*/

/*
    express.json() is a built-in middleware function in Express. 
    This method is used to parse the incoming requests with JSON payloads and is based upon the bodyparser.
    This method returns the middleware that only parses JSON and only looks at the requests where the 
    content-type header matches the type option.
*/
app.use(cors());
app.use(express.json());

/* Routes :
    Create a Task
    Get all Tasks
    Get a Task
    Update a Task
    Delete a Task
*/

app.get("/", async (req, res) => {
    try {
        res.json("Server is Running :) Hit some endpoint :)");
    } catch (error) {
        console.log(error);
    }

});

app.post("/tasks", async (req, res) => {
    try {
        const { description } = req.body;
        const newTask = await pool.query(
            "INSERT INTO tasks (description) VALUES($1) RETURNING *",
            [description]
        );
        res.json(newTask.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/tasks", async (req, res) => {
    try {
        const allTasks = await pool.query(
            "SELECT * FROM tasks"
        );
        res.json(allTasks.rows);
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await pool.query(
            "SELECT * FROM tasks WHERE task_id = $1", [id]
        );
        res.json(task.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

app.put("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const task = await pool.query(
            "UPDATE tasks SET description = $1 WHERE task_id = $2", [description, id]
        );
        res.json("Updated the Task");
    } catch (err) {
        console.log(err.message);
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await pool.query(
            "DELETE FROM tasks WHERE task_id = $1"
            , [id]);
        res.json("Deleted the Task Successfully")
    } catch (error) {
        console.log(error);
    }
})

//  bind and listen the connections on the specified host and port.
app.listen(5000, () => {
    console.log("Server Started on port 5000");
})