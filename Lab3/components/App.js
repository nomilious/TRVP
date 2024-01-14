import Tasklist from "./Tasklist";

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

    onInputKeydown = event => {
        if (event.key !== "Enter") return;

        if (event.target.value) {
            const newTasklist = new Tasklist({
                name: event.target.value,
                // onMoveTask: this.onMoveTask,
                onDropTaskInTasklist: this.onDropTaskInTasklist,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask,
            });

            this.#tasklists.push(newTasklist);
            newTasklist.render();
        }

        event.target.style.display = "none";
        event.target.value = "";

        document.querySelector(".tasklist-adder__btn").style.display =
            "inherit";
    };

    onDropTaskInTasklist = evt => {
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
            tasklist => tasklist.tasklistID === srcTasklistID,
        );
        const destTasklist = this.#tasklists.find(
            tasklist => tasklist.tasklistID === destTasklistID,
        );

        if (srcTasklistID !== destTasklistID) {
            const movedTask = srcTasklist.deleteTask({ taskID: movedTaskID });
            destTasklist.addTask({ task: movedTask });

            srcTasklist.reorderTasks();
        }

        const destTasksIDs = Array.from(
            destTasklistElement.querySelector(".tasklist__tasks-list").children,
            elem => elem.getAttribute("id"),
        );

        destTasksIDs.forEach((taskID, order) => {
            destTasklist.getTaskById({ taskID }).taskOrder = order;
        });
    };

    // moveTask = ({ taskID, direction }) => {
    //   let srcTasklistIndex = -1;

    //   this.#tasklists.forEach((tasklist, i) => {
    //     let task = tasklist.getTaskById({ taskID });
    //     if (task) {
    //       srcTasklistIndex = i;
    //     }
    //   });

    //   const destTasklistIndex = direction === 'left'
    //     ? srcTasklistIndex - 1
    //     : srcTasklistIndex + 1;

    //   const movedTask = this.#tasklists[srcTasklistIndex].deleteTask({ taskID });
    //   this.#tasklists[destTasklistIndex].addTask({ task: movedTask });
    // };

    // onMoveTask = ({ taskID, direction }) => {
    //   if (!direction || (direction !== 'left' && direction !== 'right')) return;

    //   const taskElement = document.getElementById(taskID);
    //   const srcTasklistElement = taskElement.closest('.tasklist');
    //   const destTasklistElement = direction === 'left'
    //     ? srcTasklistElement.previousElementSibling
    //     : srcTasklistElement.nextElementSibling;

    //   if (!destTasklistElement) return;

    //   destTasklistElement.querySelector('ul.tasklist__tasks-list')
    //     .appendChild(taskElement);

    //   this.moveTask({ taskID, direction });
    // };

    onEditTask = ({ taskID }) => {
        let fTask = null;
        for (let tasklist of this.#tasklists) {
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }

        const curTaskText = fTask.taskText;

        const newTaskText = prompt("Введите новое описание задачи");

        if (!newTaskText || newTaskText === curTaskText) return;

        fTask.taskText = newTaskText;

        document.querySelector(`[id="${taskID}"] span.task__text`).innerHTML =
            newTaskText;
    };

    onDeleteTask = ({ taskID }) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#tasklists) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }

        const taskShouldBeDeleted = confirm(
            `Задача '${fTask.taskText}' будет удалена. Прододлжить?`,
        );

        if (!taskShouldBeDeleted) return;

        fTasklist.deleteTask({ taskID });

        document.getElementById(taskID).remove();
    };

    init() {
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
                ".task.task_selected",
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
    }
}
