import Tasklist from "./Tasklist";
import AppModel from "../model/AppModel";

export default class App {
    #tasklists = [];

    onEscapeKeydown = event => {
        if (event.key === "Escape") {
            const input = document.querySelector(".tasklist-adder__input");
            input.style.display = "none";
            input.value = "";

            document.querySelector(".tasklist-adder__btn").style.display =
                "inherit";
        }
    };

    onInputKeydown = async event => {
        if (event.key !== "Enter") return;

        if (event.target.value) {
            const tasklistId = crypto.randomUUID();
            try {
                const res = await AppModel.addTasklists({
                    id: tasklistId,
                    name: event.target.value,
                    position: this.#tasklists.length,
                });
                console.log("add to model");
                const newTasklist = new Tasklist({
                    id: tasklistId,
                    name: event.target.value,
                    position: this.#tasklists.length,
                    onDropTaskInTasklist: this.onDropTaskInTasklist,
                    onEditTask: this.onEditTask,
                    onDeleteTask: this.onDeleteTask,
                });
                console.log("created local");

                this.#tasklists.push(newTasklist);
                newTasklist.render();
                console.log(res);
            } catch (error) {
                console.error(error);
            }
        }

        event.target.style.display = "none";
        event.target.value = "";

        document.querySelector(".tasklist-adder__btn").style.display =
            "inherit";
    };

    onDropTaskInTasklist = async evt => {
        evt.stopPropagation();

        const destTasklistElement = evt.currentTarget;
        destTasklistElement.classList.remove("tasklist_droppable");

        const movedTaskID = localStorage.getItem("movedTaskID");
        const srcTasklistID = localStorage.getItem("srcTasklistID");
        const destTasklistID = destTasklistElement.getAttribute("id");

        localStorage.setItem("movedTaskID", "");
        localStorage.setItem("srcTasklistID", "");

        if (!destTasklistElement.querySelector(`[id="${movedTaskID}"]`)) return;

        const srcTasklist = this.#tasklists.find(
            tasklist => tasklist.tasklistID === srcTasklistID
        );
        const destTasklist = this.#tasklists.find(
            tasklist => tasklist.tasklistID === destTasklistID
        );

        try {
            if (srcTasklistID !== destTasklistID) {
                const res = await AppModel.moveTasks({
                    id: movedTaskID,
                    srcTasklistId: srcTasklistID,
                    destTasklistId: destTasklistID,
                });
                const movedTask = srcTasklist.deleteTask({
                    taskID: movedTaskID,
                });
                destTasklist.addTask({ task: movedTask });

                srcTasklist.reorderTasks();
            }

            destTasklist.reorderTasks();
        } catch (error) {
            console.error(error);
        }
    };

    onEditTask = async ({ taskID }) => {
        let fTask = null;
        for (let tasklist of this.#tasklists) {
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }

        const curTaskText = fTask.taskText;
        const newTaskText = prompt("Введите новое описание задачи");

        if (!newTaskText || newTaskText === curTaskText) return;
        try {
            const res = await AppModel.editTasks({
                id: taskID,
                text: newTaskText,
            });

            fTask.taskText = newTaskText;

            document.querySelector(
                `[id="${taskID}"] span.task__text`
            ).innerHTML = newTaskText;
            console.log(res);
        } catch (error) {
            console.error(error);
        }
    };

    onDeleteTask = async ({ taskID }) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#tasklists) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }

        // const taskShouldBeDeleted = confirm(
        //     `Задача '${fTask.taskText}' будет удалена. Прододлжить?`
        // );

        // if (!taskShouldBeDeleted) return;
        try {
            const res = await AppModel.deleteTasks({ id: taskID });
            fTasklist.deleteTask({ taskID });
            document.getElementById(taskID).remove();
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    };

    async init() {
        document
            .querySelector(".tasklist-adder__btn")
            .addEventListener("click", event => {
                event.target.style.display = "none";

                const input = document.querySelector(".tasklist-adder__input");
                input.style.display = "inherit";
                input.focus();
            });

        document.addEventListener("keydown", this.onEscapeKeydown);

        document
            .querySelector(".tasklist-adder__input")
            .addEventListener("keydown", this.onInputKeydown);

        document
            .getElementById("theme-switch")
            .addEventListener("change", evt => {
                evt.target.checked
                    ? document.body.classList.add("dark-theme")
                    : document.body.classList.remove("dark-theme");
            });

        document.addEventListener("dragover", evt => {
            evt.preventDefault();

            const draggedElement = document.querySelector(
                ".task.task_selected"
            );
            const draggedElementPrevList = draggedElement.closest(".tasklist");

            const currentElement = evt.target;
            const prevDroppable = document.querySelector(".tasklist_droppable");
            let curDroppable = evt.target;
            while (
                !curDroppable.matches(".tasklist") &&
                curDroppable !== document.body
            ) {
                curDroppable = curDroppable.parentElement;
            }

            if (curDroppable !== prevDroppable) {
                if (prevDroppable)
                    prevDroppable.classList.remove("tasklist_droppable");

                if (curDroppable.matches(".tasklist")) {
                    curDroppable.classList.add("tasklist_droppable");
                }
            }

            if (
                !curDroppable.matches(".tasklist") ||
                draggedElement === currentElement
            )
                return;

            if (curDroppable === draggedElementPrevList) {
                if (!currentElement.matches(".task")) return;

                const nextElement =
                    currentElement === draggedElement.nextElementSibling
                        ? currentElement.nextElementSibling
                        : currentElement;

                curDroppable
                    .querySelector(".tasklist__tasks-list")
                    .insertBefore(draggedElement, nextElement);

                return;
            }

            if (currentElement.matches(".task")) {
                curDroppable
                    .querySelector(".tasklist__tasks-list")
                    .insertBefore(draggedElement, currentElement);

                return;
            }

            if (
                !curDroppable.querySelector(".tasklist__tasks-list").children
                    .length
            ) {
                curDroppable
                    .querySelector(".tasklist__tasks-list")
                    .appendChild(draggedElement);
            }
        });
        try {
            const tasklists = await AppModel.getTasklists();
            for (const tasklist of tasklists) {
                const tasklistObject = new Tasklist({
                    id: tasklist.id,
                    name: tasklist.name,
                    position: tasklist.position,
                    onDropTaskInTasklist: this.onDropTaskInTasklist,
                    onEditTask: this.onEditTask,
                    onDeleteTask: this.onDeleteTask,
                });
                this.#tasklists.push(tasklistObject);
                tasklistObject.render();

                for (const task of tasklist.tasks) {
                    tasklistObject.onAddNewTaskLocal({
                        id: task.id,
                        text: task.text,
                        position: task.position,
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
