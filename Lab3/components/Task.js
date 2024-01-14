export default class Task {
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
