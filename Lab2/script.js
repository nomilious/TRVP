document.addEventListener("DOMContentLoaded", () => {
    console.log("OK")
    let app = new App();
    app.init();
})
class App {
    #tasklists= [];

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
                name: event.target.value
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

    constructor({name}) {
        this.#tasklistName = name;
        this.#tasklistID = crypto.randomUUID();
    }
    get tasklistID() { return this.#tasklistID;}
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
        buttonElement.onclick = () => console.log("CLICKED")

        const adderElement = document.querySelector(".tasklist-adder")
        console.log(adderElement.parentElement)
        adderElement.parentElement.insertBefore(liElement, adderElement)

    }
}
class Task {
    #tasks= [];
    #taskText = [];
    #taskID = [];
    constructor({text}) {
        this.#taskID = crypto.randomUUID()
        this.#taskText = text
    }

    get taskID() { return this.#taskID;}
    get taskText() { return this.#taskText;}
    set taskText(value) {
        if (typeof value !== "sctring") return
        this.#taskText = value
    }
}
