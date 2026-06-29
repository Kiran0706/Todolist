import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, CalendarDays, Check, Circle, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { createTodo, deleteTodo, getTodos, updateTodo } from "./api";
import "./styles.css";

const blankTodo = {
  title: "",
  notes: "",
  category: "Focus",
  priority: "medium",
  dueDate: "",
  completed: false
};

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1
};

function getDateValue(date) {
  return date ? new Date(`${date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function formatDueDate(date) {
  if (!date) {
    return "No due date";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function getDueStatus(todo) {
  if (!todo.dueDate) {
    return "none";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${todo.dueDate}T00:00:00`);

  if (!todo.completed && due < today) {
    return "overdue";
  }

  if (due.getTime() === today.getTime()) {
    return "today";
  }

  return "upcoming";
}

function App() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(blankTodo);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    loadTodos();

    window.addEventListener("focus", loadTodos);
    window.addEventListener("pageshow", loadTodos);

    return () => {
      window.removeEventListener("focus", loadTodos);
      window.removeEventListener("pageshow", loadTodos);
    };
  }, []);

  async function loadTodos() {
    try {
      setStatus("loading");
      setTodos(await getTodos());
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  async function handleCreate(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Give the todo a title first.");
      return;
    }

    try {
      const createdTodo = await createTodo(form);
      setTodos((currentTodos) => [createdTodo, ...currentTodos]);
      setForm(blankTodo);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleTodo(todo) {
    const updatedTodo = { ...todo, completed: !todo.completed };
    setTodos((currentTodos) => currentTodos.map((item) => (item.id === todo.id ? updatedTodo : item)));

    try {
      await updateTodo(todo.id, updatedTodo);
    } catch (err) {
      setError(err.message);
      loadTodos();
    }
  }

  async function removeTodo(id) {
    const previousTodos = todos;
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));

    try {
      await deleteTodo(id);
    } catch (err) {
      setError(err.message);
      setTodos(previousTodos);
    }
  }

  const visibleTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      const matchesStatus =
        filter === "all" || (filter === "active" && !todo.completed) || (filter === "done" && todo.completed);
      const searchText = `${todo.title} ${todo.notes} ${todo.category} ${todo.dueDate || ""}`.toLowerCase();
      return matchesStatus && searchText.includes(query.toLowerCase());
    });

    return [...filtered].sort((firstTodo, secondTodo) => {
      if (sort === "due") {
        return getDateValue(firstTodo.dueDate) - getDateValue(secondTodo.dueDate);
      }

      if (sort === "priority") {
        return (priorityWeight[secondTodo.priority] || 0) - (priorityWeight[firstTodo.priority] || 0);
      }

      if (sort === "completed") {
        return Number(firstTodo.completed) - Number(secondTodo.completed);
      }

      return new Date(secondTodo.createdAt).getTime() - new Date(firstTodo.createdAt).getTime();
    });
  }, [filter, query, sort, todos]);

  const stats = useMemo(() => {
    const done = todos.filter((todo) => todo.completed).length;
    return {
      total: todos.length,
      done,
      active: todos.length - done
    };
  }, [todos]);

  return (
    <main className="app-shell">
      <section className="hero-band">
        <div>
          <p className="eyebrow">Daily workbench</p>
          <h1>Todo Atelier</h1>
          <p className="hero-copy">
            A calm place to collect unfinished thoughts, choose what matters, and turn scattered work into visible
            progress.
          </p>
        </div>
        <div className="stat-grid" aria-label="Todo summary">
          <span>
            <strong>{stats.total}</strong>
            total
          </span>
          <span>
            <strong>{stats.active}</strong>
            active
          </span>
          <span>
            <strong>{stats.done}</strong>
            done
          </span>
        </div>
      </section>

      <section className="workspace">
        <form className="composer" onSubmit={handleCreate}>
          <div className="composer-heading">
            <Sparkles size={20} aria-hidden="true" />
            <h2>Capture a task</h2>
          </div>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Name the next move"
            />
          </label>
          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Add context, a tiny plan, or the reason it matters"
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Focus"
              />
            </label>
            <label>
              Priority
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label>
            Due date
            <input
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              type="date"
            />
          </label>
          {error ? <p className="error-note">{error}</p> : null}
          <button className="primary-button" type="submit">
            <Plus size={18} aria-hidden="true" />
            Add todo
          </button>
        </form>

        <section className="todo-panel" aria-label="Todo list">
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" />
            </div>
            <div className="segments" aria-label="Filter todos">
              {["all", "active", "done"].map((option) => (
                <button
                  className={filter === option ? "active" : ""}
                  key={option}
                  onClick={() => setFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <label className="sort-box">
              Sort
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="due">Due date</option>
                <option value="priority">Priority</option>
                <option value="completed">Active first</option>
              </select>
            </label>
          </div>

          {status === "loading" ? <p className="quiet-state">Loading your list...</p> : null}
          {status === "error" ? <p className="quiet-state">Start the backend, then refresh this page.</p> : null}
          {status === "ready" && visibleTodos.length === 0 ? <p className="quiet-state">No tasks match this view.</p> : null}

          <div className="todo-list">
            {visibleTodos.map((todo) => (
              <article className={`todo-card ${todo.completed ? "completed" : ""}`} key={todo.id}>
                <button
                  className="check-button"
                  onClick={() => toggleTodo(todo)}
                  type="button"
                  aria-label={todo.completed ? "Mark active" : "Mark complete"}
                >
                  {todo.completed ? <Check size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
                </button>
                <div className="todo-main">
                  <div className="todo-line">
                    <h3>{todo.title}</h3>
                    <span className={`priority ${todo.priority}`}>{todo.priority}</span>
                  </div>
                  <p>{todo.notes || "No notes yet."}</p>
                  <div className="todo-meta">
                    <span className="category">{todo.category}</span>
                    <span className={`due-badge ${getDueStatus(todo)}`}>
                      <CalendarDays size={14} aria-hidden="true" />
                      {formatDueDate(todo.dueDate)}
                    </span>
                  </div>
                </div>
                <a className="icon-link" href={`/todo.html?id=${todo.id}`} aria-label={`Open ${todo.title}`}>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
                <button className="ghost-button" onClick={() => removeTodo(todo.id)} type="button" aria-label="Delete todo">
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
