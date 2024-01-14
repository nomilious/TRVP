import Task from "./Task";

export default class Tasklist {
    #tasks = [];
    #tasklistName = "";
    #tasklistID = "";

    constructor({
        name,
        // onMoveTask,
        onDropTaskInTasklist,
        onEditTask,
        onDeleteTask,
    }) {
        this.#tasklistName = name;
        this.#tasklistID = crypto.randomUUID();
        // this.onMoveTask = onMoveTask;
        this.onDropTaskInTasklist = onDropTaskInTasklist;
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
    }

    get tasklistID() {
        return this.#tasklistID;
    }

    addTask = ({ task }) => this.#tasks.push(task);

    getTaskById = ({ taskID }) =>
        this.#tasks.find(task => task.taskID === taskID);

    deleteTask = ({ taskID }) => {
        const deleteTaskIndex = this.#tasks.findIndex(
            task => task.taskID === taskID,
        );

        if (deleteTaskIndex === -1) return;

        const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);

        return deletedTask;
    };

    reorderTasks = () => {
        const orderedTasksIDs = Array.from(
            document.querySelector(
                `[id="${this.#tasklistID}"] .tasklist__tasks-list`,
            ).children,
            elem => elem.getAttribute("id"),
        );

        orderedTasksIDs.forEach((taskID, order) => {
            this.#tasks.find(task => task.taskID === taskID).taskOrder = order;
        });
    };

    onAddNewTask = () => {
        const newTaskText = prompt("Введите описание задачи:", "Новая задача");

        if (!newTaskText) return;

        const newTask = new Task({
            text: newTaskText,
            order: this.#tasks.length,
            // onMoveTask: this.onMoveTask,
            onEditTask: this.onEditTask,
            onDeleteTask: this.onDeleteTask,
        });
        this.#tasks.push(newTask);

        const newTaskElement = newTask.render();
        document
            .querySelector(`[id="${this.#tasklistID}"] .tasklist__tasks-list`)
            .appendChild(newTaskElement);
    };

    render() {
        const liElement = document.createElement("li");
        liElement.classList.add("tasklists-list__item", "tasklist");
        liElement.setAttribute("id", this.#tasklistID);
        liElement.addEventListener("dragstart", () =>
            localStorage.setItem("srcTasklistID", this.#tasklistID),
        );
        liElement.addEventListener("drop", this.onDropTaskInTasklist);

        const h2Element = document.createElement("h2");
        h2Element.classList.add("tasklist__name");
        h2Element.innerHTML = this.#tasklistName;
        liElement.appendChild(h2Element);

        const innerUlElement = document.createElement("ul");
        innerUlElement.classList.add("tasklist__tasks-list");
        liElement.appendChild(innerUlElement);

        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("tasklist__add-task-btn");
        button.innerHTML = "&#10010; Добавить карточку";
        button.addEventListener("click", this.onAddNewTask);
        liElement.appendChild(button);

        const adderElement = document.querySelector(".tasklist-adder");
        adderElement.parentElement.insertBefore(liElement, adderElement);
    }
}
