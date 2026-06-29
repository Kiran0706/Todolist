const express = require("express");
const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "todos.json");

app.use(cors());
app.use(express.json());

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    const starterTodos = [
      {
        id: "morning-map",
        title: "Sketch the day before opening messages",
        notes: "Pick the three tasks that would make today feel clean and intentional.",
        category: "Focus",
        priority: "high",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "desk-reset",
        title: "Reset the desk for tomorrow",
        notes: "Clear cups, close loose tabs, and leave one useful note for future-you.",
        category: "Ritual",
        priority: "medium",
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await writeTodos(starterTodos);
  }
}

async function readTodos() {
  await ensureStore();
  const rawTodos = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(rawTodos);
}

async function writeTodos(todos) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

function makeId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);

  return `${slug || "todo"}-${Date.now().toString(36)}`;
}

function cleanTodoInput(body, existingTodo = {}) {
  const title = typeof body.title === "string" ? body.title.trim() : existingTodo.title;
  const notes = typeof body.notes === "string" ? body.notes.trim() : existingTodo.notes || "";
  const category = typeof body.category === "string" ? body.category.trim() : existingTodo.category || "General";
  const priority = ["low", "medium", "high"].includes(body.priority) ? body.priority : existingTodo.priority || "medium";
  const completed = typeof body.completed === "boolean" ? body.completed : Boolean(existingTodo.completed);

  return { title, notes, category: category || "General", priority, completed };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "todo-api" });
});

app.get("/api/todos", async (req, res, next) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

app.get("/api/todos/:id", async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todo = todos.find((item) => item.id === req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (req, res, next) => {
  try {
    const input = cleanTodoInput(req.body);

    if (!input.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const now = new Date().toISOString();
    const todo = {
      id: makeId(input.title),
      ...input,
      createdAt: now,
      updatedAt: now
    };
    const todos = await readTodos();

    todos.unshift(todo);
    await writeTodos(todos);

    res.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

app.put("/api/todos/:id", async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todoIndex = todos.findIndex((item) => item.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const input = cleanTodoInput(req.body, todos[todoIndex]);

    if (!input.title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...input,
      updatedAt: new Date().toISOString()
    };

    todos[todoIndex] = updatedTodo;
    await writeTodos(todos);

    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/todos/:id", async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todoIndex = todos.findIndex((item) => item.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ message: "Todo not found" });
    }

    const input = cleanTodoInput(req.body, todos[todoIndex]);
    const updatedTodo = {
      ...todos[todoIndex],
      ...input,
      updatedAt: new Date().toISOString()
    };

    todos[todoIndex] = updatedTodo;
    await writeTodos(todos);

    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/todos/:id", async (req, res, next) => {
  try {
    const todos = await readTodos();
    const nextTodos = todos.filter((item) => item.id !== req.params.id);

    if (todos.length === nextTodos.length) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await writeTodos(nextTodos);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong while handling todos" });
});

ensureStore().then(() => {
  app.listen(PORT, () => {
    console.log(`Todo API is listening on http://localhost:${PORT}`);
  });
});
