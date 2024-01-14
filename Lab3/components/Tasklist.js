import Task from "./Task";

export default class TaskList {
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
