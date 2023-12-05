document.addEventListener("DOMContentLoaded", () => {
    console.log("OK")
    let app = new App();
    app.init();
})
class App {
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
    }

}
class TaskList {
    #tasks= [];
    #tasklistName = [];
    #tasklistID = [];

    constructor({name, onMoveTask, onEditTask, onDeleteTask}) {
        this.#tasklistName = name;
        this.#tasklistID = crypto.randomUUID();
        this.onMoveTask = onMoveTask
        this.onEditTask = onEditTask
        this.onDeleteTask = onDeleteTask
    }
    addTask = ({ task }) => this.#tasks.push(task);

    getTaskById = ({ taskID }) => this.#tasks.find(task => task.taskID === taskID)

    deleteTask = ({ taskID }) => {
        const deleteTaskIndex = this.#tasks.findIndex(task => task.taskID === taskID);

        if (deleteTaskIndex === -1) return;

        const [deletedTask] = this.#tasks.splice(deleteTaskIndex, 1);
        return deletedTask;
    };

    onAddNewTask = () => {
        const newTaskText = prompt("Введите описание задачи: ", "Новая задача")

        if (!newTaskText) return;

        const newTask = new Task({
            text: newTaskText,
            onMoveTask: this.onMoveTask,
            onEditTask: this.onEditTask,
            onDeleteTask: this.onDeleteTask
        })

        // create DOM
        const newTaskElement = newTask.render()

        this.#tasks.push(newTask)

        document.querySelector(`[id="${this.#tasklistID}"] .tasklist__tasks-list`)
            .appendChild(newTaskElement)

    }
    render () {
        const liElement = document.createElement("li")
        liElement.classList.add("tasklists-list__item", "tasklist")
        liElement.id = this.#tasklistID

        const h2Element = document.createElement("h2")
        h2Element.classList.add("tasklist__name")
        h2Element.innerHTML = this.#tasklistName
        liElement.appendChild(h2Element)

        const ulElement = document.createElement("ul")
        ulElement.classList.add("tasklist__tasks-list")
        liElement.appendChild(ulElement)

        const buttonElement = document.createElement("button")
        buttonElement.classList.add("tasklist__add-task-btn")
        buttonElement.type = "button"
        buttonElement.innerHTML = "&#10010; Добавить карточку";
        liElement.appendChild(buttonElement)
        buttonElement.onclick = this.onAddNewTask

        const adderElement = document.querySelector(".tasklist-adder")
        adderElement.parentElement.insertBefore(liElement, adderElement)
    }
    get tasklistID() { return this.#tasklistID;}
}
class Task {
    #taskText = [];
    #taskID = [];
    constructor({text, onMoveTask, onEditTask, onDeleteTask}) {
        this.#taskID = crypto.randomUUID()
        this.#taskText = text
        this.onMoveTask = onMoveTask
        this.onEditTask = onEditTask
        this.onDeleteTask = onDeleteTask
    }

    get taskID() { return this.#taskID;}
    get taskText() { return this.#taskText;}
    set taskText(value) {
        if (typeof value !== "string") return
        this.#taskText = value
    }

    render() {
        const liEment = document.createElement("li")
        liEment.classList.add("tasklist__tasks-list-item", "task")
        liEment.id = this.#taskID

        const spanElement = document.createElement("span")
        spanElement.classList.add("task__text")
        spanElement.innerHTML = this.#taskText
        liEment.appendChild(spanElement)

        const controlsDiv = document.createElement("div")
        controlsDiv.classList.add("task__controls")

        const upperRowDiv = document.createElement("div")
        upperRowDiv.classList.add("task__controls-row")

        const leftArrowBtn = document.createElement("button")
        leftArrowBtn.classList.add("task__contol-btn", "left-arrow-icon")
        leftArrowBtn.type = "button"
        leftArrowBtn.onclick = () => this.onMoveTask({taskID: this.#taskID, direction: 'left' })

        const rightArrowBtn = document.createElement("button")
        rightArrowBtn.classList.add("task__contol-btn", "right-arrow-icon")
        rightArrowBtn.type = "button"
        rightArrowBtn.onclick = () => this.onMoveTask({taskID: this.#taskID, direction: 'right' })

        upperRowDiv.appendChild(leftArrowBtn)
        upperRowDiv.appendChild(rightArrowBtn)
        controlsDiv.appendChild(upperRowDiv)

        const lowerRowDiv = document.createElement("div")
        lowerRowDiv.classList.add("task__controls-row")

        const editBtn = document.createElement("button")
        editBtn.classList.add("task__contol-btn", "edit-icon")
        editBtn.type = "button"
        editBtn.onclick = () => this.onEditTask({taskID: this.#taskID})

        const deleteBtn = document.createElement("button")
        deleteBtn.classList.add("task__contol-btn", "delete-icon")
        deleteBtn.type = "button"
        deleteBtn.onclick = () => this.onDeleteTask({taskID: this.#taskID})

        lowerRowDiv.appendChild(editBtn)
        lowerRowDiv.appendChild(deleteBtn)
        controlsDiv.appendChild(lowerRowDiv)

        liEment.appendChild(controlsDiv)

        return liEment;
    }
}
