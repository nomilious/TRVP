import pg from "pg";

export default class DB {
    #dbClient = null;
    #dbHost = "";
    #dbPort = "";
    #dbName = "";
    #dbLogin = "";
    #dbPassword = "";

    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            database: this.#dbName,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
        });
    }
    areParamsSet(params, func) {
        const allParamsSet = Object.entries(params).every(([key, value]) => {
            if (value === null) {
                return false;
            }
            if (typeof value === "number" && value === -1) {
                return false;
            }
            if (typeof value === "string" && value === "") {
                return false;
            }
            return true;
        });

        if (!allParamsSet) {
            const errMsg = `${func}() error: wrong params (${Object.entries(
                params,
            )
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")})`;
            throw { type: "client", error: new Error(errMsg) };
        }

        return true;
    }
    async connect() {
        try {
            await this.#dbClient.connect();
            console.log("DB Connected");
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
    async disconnect() {
        await this.#dbClient.end();
        console.log("DB Disc onnected");
    }
    async getTaskLists() {
        try {
            const tasklists = await this.#dbClient.query(
                "SELECT * FROM TASKLISTS ORDER BY POSITION;",
            );

            return tasklists.rows;
        } catch (error) {
            console.error("Unable to get tasklists", error);
            return Promise.reject(error);
        }
    }
    async getTasks() {
        try {
            const tasks = await this.#dbClient.query(
                "SELECT * FROM TASKS ORDER BY tasklist_id, POSITION;",
            );

            return tasks.rows;
        } catch (error) {
            console.error("Unable to get tasks", error);
            return Promise.reject({ type: "internal", error });
        }
    }

    async addTasklist({ id = null, name = "", position = -1 }) {
        const _params = { id, name, position };
        this.areParamsSet(_params, "addTasklist");

        try {
            await this.#dbClient.query(
                "INSERT INTO TASKLISTS (ID, NAME, POSITION) VALUES ($1, $2, $3);",
                [id, name, position],
            );
        } catch (error) {
            console.error("Unable to add tasklists", error);
            return Promise.reject(error);
        }
    }
    async addTask({ id = null, name = "", position = -1, tasklistId = null }) {
        const _params = { id, name, position, tasklistId };
        try {
            this.areParamsSet(_params, "addTask");
        } catch (err) {
            console.log(err);
        }

        try {
            await this.#dbClient.query(
                "INSERT INTO TASKS (ID, TEXT, POSITION, tasklist_id) VALUES ($1, $2, $3, $4);",
                [id, name, position, tasklistId],
            );
            await this.#dbClient.query(
                "UPDATE TASKLISTS SET TASKS = ARRAY_APPEND(TASKS, $1) WHERE ID =$2;",
                [id, tasklistId],
            );
        } catch (error) {
            console.error("Unable to add task, error: ", error);
            return Promise.reject(error);
        }
    }

    async updateTask({ id = null, text = "", position = -1 }) {
        const _params = { id, text, position };
        this.areParamsSet(_params, "updateTask");

        let query = "";
        let params = [];
        if (text && position >= 0) {
            query = "UPDATE tasks SET text = $1, position = $2 WHERE id = $3; ";
            params.push(text, position, id);
        } else if (text) {
            query = "UPDATE tasks SET text = $1 WHERE id = $2";
            params.push(text, id);
        } else {
            query = "UPDATE tasks SET position = $1 WHERE id = $2; ";
            params.push(position, id);
        }

        try {
            await this.#dbClient.query(query, params);
        } catch (error) {
            console.error("Unable to updateTaskk, error: ", error);
            return Promise.reject(error);
        }
    }
    async deleteTask({ id = null, taskId = null }) {
        const _params = { id, taskId };
        this.areParamsSet(_params, "deleteTask");

        try {
            await this.#dbClient.query(
                "UPDATE TASKLISTS SET TASKS = ARRAY_REMOVE(TASKS, $1) WHERE ID =$2;",
                [id, taskId],
            );
            await this.#dbClient.query("DELETE TASKS WHERE ID = $1;", [id]);
        } catch (error) {
            console.error("Unable to deleteTask, error: ", error);
            return Promise.reject(error);
        }
    }
    async moveTask({ id = null, srcTadkId = null, destTaskId = null }) {
        const _params = { id, srcTadkId, destTaskId };
        this.areParamsSet(_params, "moveTask");

        try {
            await this.#dbClient.query(
                "UPDATE TASKS SET tasklist_id = $2 WHERE ID = $2;",
                [destTaskId, id],
            );
            await this.#dbClient.query(
                "UPDATE TASKLISTS SET TASKS = ARRAY_APPEND(TASKS, $2) WHERE ID = $1;",
                [destTaskId, id],
            );
            await this.#dbClient.query(
                "UPDATE TASKLISTS SET TASKS = ARRAY_REMOVE(TASKS, $2) WHERE ID = $1;",
                [srcTadkId, id],
            );
        } catch (error) {
            console.error("Unable to moveTask, error: ", error);
            return Promise.reject(error);
        }
    }
}
