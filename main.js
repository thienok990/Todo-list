"use strict";
let Todo_App = {
  tasks: [],
  currentTab: "All",
  selectors: {
    date: ".date",
    month: ".month",
    taskList: ".todo__container__list__task",
    taskInput: ".todo__container__input input.taskCheck",
    taskRename: '.todo__container__input [data-action="Rename"]',
    taskDelete: '.todo__container__input [data-action="Delete"]',
    taskMoveUp: '.todo__container__input [data-action="MoveUp"]',
    taskMoveDown: '.todo__container__input [data-action="MoveDown"]',
    addButton: "button#btnAdd",
    saveButton: "button#btnSave",
    labelInput: "input#inputText",
    clearButton: "button#btnClear",
    taskCounter: ".total-task",
    tab: ".todo__navbar >ul > li",
  },
  currentEditTaskId: null,
  render: function () {
    this.updateTaskCounter();
    this.renderHTML();
    this.registerTaskEvents();
    this.dragAndDrop();
  },
  renderHTML: function () {
    let html = "";
    this.sortTasks();
    const filteredTasks = this.filterTasksByTab();
    filteredTasks.forEach((task, index) => {
      const { id, status, label } = task;
      html += `<li class="todo__container__input">
            <div class="task" draggable="true">
                <i class="fa-solid fa-bars task-drag"></i>
                <input type="checkbox" class="taskCheck" id="task-${id}" data-id="${id}" ${
        status == "Completed" ? "checked" : ""
      }>
                <label class="${
                  status == "Completed" ? "checked" : ""
                }" for="task-${id}">${label} (${status})</label>
            </div>
            <div class="dropdown">
                <i class="fa-solid fa-ellipsis"></i>
                <ul class="menu">
                    <li data-id="${id}" data-action="Rename">Rename</li>
                    <li data-id="${id}" data-action="Delete">Delete</li>
                    ${
                      index !== 0
                        ? `<li data-id="${id}" data-action="MoveUp">
                          Move Up
                        </li>`
                        : ""
                    }
                    ${
                      index !== filteredTasks.length - 1
                        ? `<li data-id="${id}" data-action="MoveDown">
                          Move Down
                        </li>`
                        : ""
                    }
                </ul>                        
            </div>
        </li>`;
    });
    const taskListContainer = document.querySelector(this.selectors.taskList);
    if (taskListContainer) {
      taskListContainer.innerHTML = html;
    }
  },
  filterTasksByTab: function () {
    const result = this.tasks.filter((task) => {
      if (this.currentTab === "All") return task;
      return task.status === this.currentTab;
    });
    return result;
  },
  sortTasks: function () {
    this.tasks.sort((task_a, task_b) => {
      return task_a.position - task_b.position;
    });
  },
  registerMainEvents: function () {
    document
      .querySelector(this.selectors.addButton)
      .addEventListener("click", this.addTask.bind(this));
    document
      .querySelector(this.selectors.clearButton)
      .addEventListener("click", this.clearTasks.bind(this));
    document
      .querySelector(this.selectors.saveButton)
      .addEventListener("click", this.saveTask.bind(this));
    document.querySelectorAll(this.selectors.tab).forEach((tabItem) => {
      tabItem.addEventListener("click", this.changeTab.bind(this));
    });
  },
  registerTaskEvents: function () {
    const that = this;
    document.querySelectorAll(that.selectors.taskInput).forEach((taskInput) => {
      taskInput.addEventListener("change", function () {
        const newStatus = taskInput.checked ? "Completed" : "Pending";
        that.changeStatus(taskInput.dataset.id, newStatus);
      });
    });
    document.querySelectorAll(that.selectors.taskDelete).forEach((button) => {
      button.addEventListener("click", function () {
        that.deleteTask(button.dataset.id);
      });
    });
    document.querySelectorAll(that.selectors.taskRename).forEach((button) => {
      button.addEventListener("click", function () {
        that.renameTask(button.dataset.id);
      });
    });
    document.querySelectorAll(that.selectors.taskMoveUp).forEach((button) => {
      button.addEventListener("click", function () {
        that.moveUpTask(button.dataset.id);
      });
    });
    document.querySelectorAll(that.selectors.taskMoveDown).forEach((button) => {
      button.addEventListener("click", function () {
        that.moveDownTask(button.dataset.id);
      });
    });
  },
  changeTab: function (event) {
    this.currentTab = event.target.id;
    document.querySelectorAll(this.selectors.tab).forEach((tabItem) => {
      tabItem.classList.remove("selected");
    });
    event.target.classList.add("selected");
    this.render();
  },
  addTask: function () {
    const labelValue = document
      .querySelector(this.selectors.labelInput)
      .value.trim();
    if (labelValue == "") {
      alert("Please enter label");
      return;
    }
    const newTask = {
      id: Date.now(),
      label: labelValue,
      status: "Pending",
      position: this.tasks.length + 1,
    };
    this.tasks.push(newTask);
    this.resetLabelInput();
    this.render();
    this.saveTasksToStorage();
  },
  clearTasks: function () {
    this.tasks = [];
    this.render();
    this.saveTasksToStorage();
  },
  updateTaskCounter: function () {
    document.querySelector(this.selectors.taskCounter).innerHTML = `${
      this.tasks.length
    } Task${this.tasks.length > 1 ? "s" : ""}`;
  },
  resetLabelInput: function () {
    document.querySelector(this.selectors.labelInput).value = "";
  },
  changeStatus: function (taskId, status) {
    this.tasks.forEach((task) => {
      if (task.id == taskId) {
        task.status = status;
      }
    });
    this.render();
    this.saveTasksToStorage();
  },
  renameTask: function (taskId) {
    this.currentEditTaskId = taskId;
    console.log(this.currentEditTaskId);
    const currentTask = this.tasks.find((task) => task.id == taskId);
    document.querySelector(this.selectors.labelInput).value = currentTask.label;
    document.querySelector(this.selectors.saveButton).style.display = "block";
    document.querySelector(this.selectors.addButton).style.display = "none";
  },
  saveTask: function () {
    const labelValue = document
      .querySelector(this.selectors.labelInput)
      .value.trim();
    if (labelValue == "") {
      alert("Please enter label");
      return;
    }
    document.querySelector(this.selectors.saveButton).style.display = "none";
    document.querySelector(this.selectors.addButton).style.display = "block";
    this.tasks.forEach((task) => {
      if (task.id == this.currentEditTaskId) {
        task.label = labelValue;
      }
    });
    this.resetLabelInput();
    this.render();
    this.saveTasksToStorage();
  },
  deleteTask: function (taskId) {
    const newTaskList = this.tasks.filter((task) => task.id != taskId);
    this.tasks = newTaskList;
    this.render();
    this.saveTasksToStorage();
  },
  moveUpTask: function (taskId) {
    const currentIndex = this.tasks.findIndex((task) => task.id == taskId);
    const tmp = this.tasks[currentIndex].position;
    this.tasks[currentIndex].position = this.tasks[currentIndex - 1].position;
    this.tasks[currentIndex - 1].position = tmp;
    this.saveTasksToStorage();
    this.render();
  },
  moveDownTask: function (taskId) {
    const currentIndex = this.tasks.findIndex((task) => task.id == taskId);
    const tmp = this.tasks[currentIndex].position;
    this.tasks[currentIndex].position = this.tasks[currentIndex + 1].position;
    this.tasks[currentIndex + 1].position = tmp;
    this.saveTasksToStorage();
    this.render();
  },
  saveTasksToStorage: function () {
    window.localStorage.setItem("tasks", JSON.stringify(this.tasks));
  },
  loadTasksFromStorage: function () {
    const tasksFromStorage = window.localStorage.getItem("tasks");
    if (tasksFromStorage) {
      this.tasks = JSON.parse(tasksFromStorage);
    }
  },
  init: function () {
    this.loadTasksFromStorage();
    this.render();
    this.updateDateTime();
    this.registerMainEvents();
  },
  dragAndDrop: function () {
    var el = document.querySelector(".todo__container__list__task");
    Sortable.create(el, {
      group: {
        name: "sorting",
        sort: true,
      },
      handle: ".task-drag",
      animation: 100,
      onSort: function (event) {
        const sortedTaskElements = document.querySelectorAll(
          ".todo__container__list__task input.taskCheck"
        );
        const data = [];
        sortedTaskElements.forEach((element, index) => {
          data.push({
            id: element.dataset.id,
            position: index + 1,
          });
        });
        const sortedTaskList = this.tasks.map((task) => {
          const findTask = data.find((item) => item.id == task.id);
          return {
            ...task,
            position: findTask.position,
          };
        });
        this.tasks = sortedTaskList;
        this.render();
        this.saveTasksToStorage();
      }.bind(this),
    });
  },
  updateDateTime: function () {
    const date = new Date();
    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let seridalDay =
      date.getDate() === 1
        ? "st"
        : date.getDate() === 2
        ? "nd"
        : date.getDate() === 3
        ? "rd"
        : "th";
    document.querySelector(this.selectors.date).innerHTML =
      dayOfWeek[date.getDay()] + ", " + date.getDate() + seridalDay;
    document.querySelector(this.selectors.month).innerHTML =
      month[date.getMonth()];
  },
};
window.addEventListener("DOMContentLoaded", function () {
  Todo_App.init();
});
