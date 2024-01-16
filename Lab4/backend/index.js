import express from "express"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import DB from "./db/client.js"

dotenv.config({
    path: "./backend/.env",
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app_host = process.env.APP_HOST
const app_port = process.env.APP_PORT

const app = express()
const db = new DB()

// logging middleware
app.use("*", (req, res, next) => {
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString())
    next()
})

// middleware for static app files
app.use("/", express.static(path.resolve(__dirname, "../dist")))

app.get("/tasklists", async (req, res) => {
    try {
        const [_tasks, dbTasklists] = await Promise.all([
            db.getTasks(),
            db.getTaskLists(),
        ])
        const tasklists = dbTasklists.map(tasklist => ({
            id: tasklist.id,
            name: tasklist.name,
            position: tasklist.position,
            tasks: _tasks.filter(
                task => tasklist.tasks.indexOf(task.id) !== -1
            ),
        }))
        res.statusCode = 200
        res.statusMessage = "OK"
        res.json({ tasklists })
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting tasklists and tasks error: ${err}`,
        })
    }
})
// add tasklists
app.use("/tasklists", express.json())
app.post("/tasklists", async (req, res) => {
    try {
        const { id, name, position } = req.body
        await db.addTasklist({ id, name, position })

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Creating tasklists error: ${err}`,
        })
    }
})
// add tasks
app.use("/tasks", express.json())
app.post("/tasks", async (req, res) => {
    try {
        const { id, text, position, tasklistId } = req.body
        await db.addTask({ id, text, position, tasklistId })

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Creating task error: ${err}`,
        })
    }
})
// edit tasks params
app.use("/tasks/:id", express.json())
app.patch("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { text, position } = req.body
        await db.updateTask({ id, text, position })

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Update task error: ${err}`,
        })
    }
})
// edit sever tasks position
app.patch("/tasks", async (req, res) => {
    try {
        const { reorderedTasks } = req.body
        await Promise.all(
            reorderedTasks.map(({ id, position }) =>
                db.updateTask({ id, position })
            )
        )

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Update task error: ${err}`,
        })
    }
})

// delete task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params
        await db.deleteTask({ id })

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Delete task error: ${err}`,
        })
    }
})
// move task between tasklists
app.patch("/tasklists", async (req, res) => {
    try {
        const { id, srcTasklistId, destTasklistId } = req.body
        await db.moveTask({ id, srcTasklistId, destTasklistId })

        res.statusCode = 200
        res.statusMessage = "OK"
        res.send()
    } catch (err) {
        res.statusCode = 500
        res.statusMessage = "Error"
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Move task error: ${err}`,
        })
    }
})

const server = app.listen(Number(app_port), app_host, async () => {
    try {
        db.connect()
    } catch (error) {
        console.error(error)
        process.exit()
    }
    console.log(
        `Task manager backend started at http://${app_host}:${app_port}`
    )
    await db.addTask({
        id: crypto.randomUUID(),
        name: "Task 124323",
        position: 2,
        tasklistId: "19358d53-803c-4f75-91d4-f0c1c03abf96",
    })
    // console.log(await db.getTaskLists(), await db.getTasks());
})
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server")
    server.close(async () => {
        await db.disconnect()
        console.log("HTTP server closed")
    })
})
