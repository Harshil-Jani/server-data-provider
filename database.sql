CREATE DATABASE pernkeep;

CREATE TABLE tasks(
    task_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    deadline DATE
);