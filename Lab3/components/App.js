import TaskList from "./Tasklist";

export default class App {
    #tasklists= [];

    moveTask = ({ taskID, direction }) => {
        let srcTasklistIndex = -1;

        this.#tasklists.forEach((tasklist, i) => {
            let task = tasklist.getTaskById({ taskID });
            if (task) {
                srcTasklistIndex = i;
            }
        });

        const destTasklistIndex = direction === 'left'
            ? srcTasklistIndex - 1
            : srcTasklistIndex + 1;

        const movedTask = this.#tasklists[srcTasklistIndex].deleteTask({ taskID });
        this.#tasklists[destTasklistIndex].addTask({ task: movedTask });
    };

    onMoveTask = ({taskID, direction}) => {
        if (!direction || (direction !== 'left' && direction !== 'right')) return;

        const taskElement = document.getElementById(taskID);
        const srcTasklistElement = taskElement.closest('.tasklist');
        const destTasklistElement = direction === 'left'
            ? srcTasklistElement.previousElementSibling
            : srcTasklistElement.nextElementSibling;

        if (!destTasklistElement) return;

        destTasklistElement.querySelector('ul.tasklist__tasks-list')
            .appendChild(taskElement);

        this.moveTask({ taskID, direction });
    }
    onEditTask = ({taskID}) => {
        let fTask = null;
        for (let tasklist of this.#tasklists) {
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }
        const curTaskText = fTask.taskText;

        const newTaskText = prompt('Введите новое описание задачи', curTaskText);

        if (!newTaskText || newTaskText === curTaskText) return;

        fTask.taskText = newTaskText;

        document.querySelector(`[id="${taskID}"] span.task__text`).innerHTML = newTaskText;
    }
    onDeleteTask = ({ taskID }) => {
        let fTask = null;
        let fTasklist = null;
        for (let tasklist of this.#tasklists) {
            fTasklist = tasklist;
            fTask = tasklist.getTaskById({ taskID });
            if (fTask) break;
        }
        console.log(fTask, fTasklist)

        const taskShouldBeDeleted = confirm(`Задача '${fTask.taskText}' будет удалена. Прододлжить?`);

        if (!taskShouldBeDeleted) return;

        fTasklist.deleteTask({ taskID });

        document.getElementById(taskID).remove();
    };

    // стрелочные функции - привязка к контексту
    onKeyDown = (event) => {
        if (event.key === "Escape") {
            const button = document.querySelector(".tasklist-adder__btn");
            const input = document.querySelector(".tasklist-adder__input");
            button.style.display ="inherit";
            input.style.display = "none";
            input.value = "";
        }
    }
    onInputKeyDown = event => {
        const button = document.querySelector(".tasklist-adder__btn");
        if (event.key !== "Enter") return;

        if (event.target.value) {
            const newTasklist = new TaskList({
                name: event.target.value,
                onMoveTask: this.onMoveTask,
                onEditTask: this.onEditTask,
                onDeleteTask: this.onDeleteTask
            });
            newTasklist.render()

            this.#tasklists.push(newTasklist);
        }
        event.target.display = "none";
        event.target.value = "";
        event.target.style.display = "none";
        button.style.display = "inherit";
    }

    init() {
        const button = document.querySelector(".tasklist-adder__btn");
        const input = document.querySelector(".tasklist-adder__input");
        button.addEventListener("click", (event)=> {
                event.target.style.display = "none";
                input.style.display ="inherit";
                input.focus()
            }
        )
        document.addEventListener("keydown", this.onKeyDown)
        input.addEventListener("keydown", this.onInputKeyDown)

        document.getElementById("theme-switch")
            .addEventListener("change", evt => { 
                evt.target.checked
                    ? document.body.classList.add("dark-theme")
                    : document.body.classList.remove("dark-theme")
            })
    }

}
