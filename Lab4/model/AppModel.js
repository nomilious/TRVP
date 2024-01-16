const API_BASE_URL = "http://localhost:4321"

export default class AppModel {
    static async fetchData(url, method, bodyData = {}, message = "") {
        try {
            const response = await fetch(`${API_BASE_URL}/${url}`, {
                method,
                body: JSON.stringify(bodyData),
                headers: {
                    "Content-Type": "application/json",
                },
            })

            const responseBody = await response.json()

            if (response.status !== 200) {
                return Promise.reject(responseBody)
            }

            return responseBody
                ? responseBody.tasklists
                : {
                      timestamp: new Date().toISOString(),
                      message: message,
                  }
        } catch (err) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message,
            })
        }
    }
    static async Tasklists() {
        return AppModel.fetchData("tasklists", "GET")
    }
    static async addTasklists({ id = null, name = "", position = -1 }) {
        return AppModel.fetchData(
            "tasklists",
            "POST",
            {
                id,
                name,
                position,
            },
            "Success addTasklists"
        )
    }
    static async addTasks({
        id = null,
        text = "",
        position = -1,
        tasklistId = null,
    }) {
        return AppModel.fetchData(
            "tasks",
            "POST",
            {
                id,
                text,
                position,
                tasklistId,
            },
            "Success addTasks"
        )
    }
    static async editTasks({ id = null, text = "", position = -1 }) {
        return AppModel.fetchData(
            `tasks/${id}`,
            "PATCH",
            {
                text,
                position,
            },
            "Success editTasks"
        )
    }
    static async editMultipleTasks({ reorderedTasks = [] }) {
        return AppModel.fetchData(
            "tasks",
            "PATCH",
            { reorderedTasks },
            "Success editMultipleTasks"
        )
    }
    static async deleteTasks({ id = null }) {
        return AppModel.fetchData(
            `tasks/${id}`,
            "DELETE",
            {},
            "Success deleteTasks"
        )
    }
    static async moveTasks({
        id = null,
        srcTasklistId = null,
        destTasklistId = null,
    }) {
        return AppModel.fetchData(
            "tasklists",
            "PATCH",
            {
                id,
                srcTasklistId,
                destTasklistId,
            },
            "Success moveTasks"
        )
    }
}
