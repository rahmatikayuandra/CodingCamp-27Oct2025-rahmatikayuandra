const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const dateInput = document.getElementById("dateInput");
const todoList = document.getElementById("todoList");
const filterButtons = document.querySelectorAll(".filter-btn");

const confirmModal = new bootstrap.Modal(
  document.getElementById("confirmModal")
);
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalBody = document.getElementById("confirmModalBody");
const confirmModalBtn = document.getElementById("confirmModalBtn");

let todos = [];
let confirmAction = null;

const savedTodos = localStorage.getItem("todos");
if (savedTodos) {
  todos = JSON.parse(savedTodos);
}

const searchInput = document.getElementById("searchInput");
const dateFilterButtons = document.querySelectorAll(".date-filter");

let currentDateFilter = "all";
let currentSearchText = "";

function renderTodos(filter = "all") {
  todoList.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  const filtered = todos.filter((todo) => {
    if (filter === "completed" && !todo.completed) return false;
    if (filter === "ongoing" && todo.completed) return false;

    if (
      currentSearchText &&
      !todo.text.toLowerCase().includes(currentSearchText.toLowerCase())
    )
      return false;

    if (currentDateFilter === "today" && todo.date !== today) return false;
    if (currentDateFilter === "upcoming" && todo.date <= today) return false;
    if (currentDateFilter === "overdue" && todo.date >= today) return false;

    return true;
  });

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `list-group-item d-flex justify-content-between align-items-center ${
      todo.completed ? "completed" : ""
    }`;

    li.innerHTML = `
      <div>
        <strong>${todo.text}</strong><br>
        <small>${todo.date}</small>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-brown me-1" onclick="toggleComplete(${
          todo.id
        })">
          ${todo.completed ? "Undo" : "Done"}
        </button>
        <button class="btn btn-sm btn-outline-brown me-1" onclick="openEditModal(${
          todo.id
        })">Edit</button>
        <button class="btn btn-sm btn-outline-brown" onclick="openDeleteModal(${
          todo.id
        })">Delete</button>
      </div>
    `;

    todoList.appendChild(li);
  });
}

function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = todoInput.value.trim();
  const date = dateInput.value;

  if (!task || !date) return;

  const newTodo = {
    id: Date.now(),
    text: task,
    date: date,
    completed: false,
  };

  todos.push(newTodo);
  saveToLocalStorage();

  todoInput.value = "";
  dateInput.value = "";
  todoInput.focus();

  const activeFilter =
    document.querySelector(".filter-btn.active").dataset.filter;
  renderTodos(activeFilter);
});

function toggleComplete(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveToLocalStorage();
  const activeFilter =
    document.querySelector(".filter-btn.active").dataset.filter;
  renderTodos(activeFilter);
}

function openEditModal(id) {
  const todo = todos.find((t) => t.id === id);
  confirmModalTitle.textContent = "Edit Task";
  confirmModalBody.innerHTML = `
    <input type="text" id="editInput" class="form-control mb-2" value="${todo.text}">
  `;
  confirmModalBtn.textContent = "Save";
  confirmAction = () => {
    const newText = document.getElementById("editInput").value.trim();
    if (newText) {
      todos = todos.map((t) => (t.id === id ? { ...t, text: newText } : t));
      saveToLocalStorage();
      const activeFilter =
        document.querySelector(".filter-btn.active").dataset.filter;
      renderTodos(activeFilter);
    }
  };
  confirmModal.show();
}

function openDeleteModal(id) {
  confirmModalTitle.textContent = "Delete Task";
  confirmModalBody.textContent = "Are you sure you want to delete this task?";
  confirmModalBtn.textContent = "Delete";
  confirmAction = () => {
    todos = todos.filter((t) => t.id !== id);
    saveToLocalStorage();
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderTodos(activeFilter);
  };
  confirmModal.show();
}

confirmModalBtn.addEventListener("click", () => {
  if (confirmAction) confirmAction();
  confirmModal.hide();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    renderTodos(filter);
  });
});

searchInput.addEventListener("input", (e) => {
  currentSearchText = e.target.value.trim();
  const activeFilter =
    document.querySelector(".filter-btn.active").dataset.filter;
  renderTodos(activeFilter);
});

dateFilterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentDateFilter = btn.dataset.filter;
    const activeFilter =
      document.querySelector(".filter-btn.active").dataset.filter;
    renderTodos(activeFilter);
  });
});

renderTodos();
