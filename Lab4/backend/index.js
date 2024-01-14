import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import DB from "./db/client.js";

dotenv.config({
    path: "./backend/.env",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app_host = process.env.APP_HOST;
const app_port = process.env.APP_PORT;

const app = express();
const db = new DB();

// logging middleware
app.use("*", (req, res, next) => {
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString());
    next();
});

// middleware for static app files
app.use("/", express.static(path.resolve(__dirname, "../dist")));

app.get("/tasklists", (req, res) => {
    try {
        const [_tasks, dbTasklists] = Promise.all(db.getTasks, db.getTaskLists);
        const tasklists = dbTasklists.map(tasklist => ({
            id: tasklist.id,
            name: tasklist.name,
            position: tasklist.position,
            tasks: _tasks.filter(task => tasklist.indexOf(task.id) !== -1),
        }));
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ tasklists });
    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting tasklists and tasks error: ${
                err.error.message || err.error
            }`,
        });
    }
});

const server = app.listen(Number(app_port), app_host, async () => {
    try {
        db.connect();
    } catch (error) {
        console.error(error);
        process.exit();
    }
    console.log(
        `Task manager backend started at http://${app_host}:${app_port}`,
    );
    await db.addTask({
        id: crypto.randomUUID(),
        name: "Task 124323",
        position: 2,
        tasklistId: "19358d53-803c-4f75-91d4-f0c1c03abf96",
    });
    // console.log(await db.getTaskLists(), await db.getTasks());
});
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(async () => {
        await db.disconnect();
        console.log("HTTP server closed");
    });
});
