import express from "express";
import cors from "cors";
import { pool } from "./db.js";

/*
    Using below implementation from fakeDataProvider as used for frontend
    ```
    const dataProvider = fakeDataProvider({
        // Our Data
    });
    ```
    We got the getList method working 
    dataProvider.getList("tasks").then((response) => { console.log(response) }); 

    We need the same implementation for our server. 
    Approach : 
    1. Modify the my_server.ts file to initialize our server. 
    2. https://github.com/marmelab/FakeRest/tree/master/src This is what we should target for initializing our own server.
    Please refer comments in my_server.ts file. 
*/

const app = express();

app.use(cors());
app.use(express.json());

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
        console.log(res);
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

app.listen(5000, () => {
    console.log("Server Started on port 5000");
})
