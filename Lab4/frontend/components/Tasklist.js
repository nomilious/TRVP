import Task from "./Task";
import AppModel from "../model/AppModel";

export default class Tasklist {
    #tasks = [];
    #tasklistName = "";
    #tasklistID = null;
    #tasklistPosition = -1;

    constructor({
        id = null,
        name,
        position,
        onDropTaskInTasklist,
        onEditTask,
        onDeleteTask,
    }) {
        this.#tasklistID = id || crypto.randomUUID();
        this.#tasklistName = name;
        this.position = position;
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
            task => task.taskID === taskID
        );

        if (deleteTaskIndex === -1) return;

        const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);

        return deletedTask;
    };

    reorderTasks = async () => {
        const orderedTasksIDs = Array.from(
            document.querySelector(
                `[id="${this.#tasklistID}"] .tasklist__tasks-list`
            ).children,
            elem => elem.getAttribute("id")
        );
        let reorderTaskInfo = [];

        orderedTasksIDs.forEach((taskID, position) => {
            const task = this.#tasks.find(task => task.taskID === taskID);
            if (task.taskPosition !== position) {
                reorderTaskInfo.push({ id: taskID, position });
                task.taskPosition = position;
            }
        });
        if (reorderTaskInfo.length >= 1) {
            try {
                await AppModel.editMultipleTasks({
                    reorderedTasks: reorderTaskInfo,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    onAddNewTask = async () => {
        const newTaskText = prompt("Введите описание задачи:", "Новая задача");

        if (!newTaskText) return;

        try {
            const id = crypto.randomUUID();
            const res = await AppModel.addTasks({
                id: id,
                text: newTaskText,
                position: this.#tasks.length,
                tasklistId: this.#tasklistID,
            });
            this.onAddNewTaskLocal({
                id,
                text: newTaskText,
                position: this.#tasks.length,
            });
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    };
    onAddNewTaskLocal = ({ id = null, text = "", position = -1 }) => {
        const newTask = new Task({
            id,
            text,
            position,
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
            localStorage.setItem("srcTasklistID", this.#tasklistID)
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
