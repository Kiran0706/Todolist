import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2
} from "lucide-react";
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

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "My Tasks", icon: ClipboardList },
  { label: "Today", icon: Calendar },
  { label: "Upcoming", icon: CalendarCheck },
  { label: "Completed", icon: CheckCircle2 },
  { label: "Categories", icon: FolderKanban },
  { label: "Focus Timer", icon: Timer },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings }
];

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getDateValue(date) {
  return date ? new Date(`${date}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
}

function isSameDay(firstDate, secondDate) {
  return firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();
}

function formatDueDate(date, completed = false) {
  if (!date) {
    return "No due date";
  }

  const due = new Date(`${date}T00:00:00`);
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const formattedDate = due.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });

  if (completed) {
    return `Completed on ${formattedDate}`;
  }

  if (isSameDay(due, today)) {
    return "Due today";
  }

  if (isSameDay(due, tomorrow)) {
    return "Due tomorrow";
  }

  return `Due ${formattedDate}`;
}

function getDueStatus(todo) {
  if (!todo.dueDate) {
    return "none";
  }

  const today = getToday();
  const due = new Date(`${todo.dueDate}T00:00:00`);

  if (!todo.completed && due < today) {
    return "overdue";
  }

  if (isSameDay(due, today)) {
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
    const today = getToday();
    const done = todos.filter((todo) => todo.completed).length;
    const dueToday = todos.filter((todo) => todo.dueDate && isSameDay(new Date(`${todo.dueDate}T00:00:00`), today)).length;

    return {
      total: todos.length,
      done,
      active: todos.length - done,
      dueToday,
      productivity: todos.length ? Math.round((done / todos.length) * 100) : 0
    };
  }, [todos]);

  const categoryRows = useMemo(() => {
    const counts = todos.reduce((summary, todo) => {
      summary[todo.category] = (summary[todo.category] || 0) + 1;
      return summary;
    }, {});

    return Object.entries(counts).sort((first, second) => second[1] - first[1]).slice(0, 5);
  }, [todos]);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <Check size={22} aria-hidden="true" />
          </span>
          <span>Todo Atelier</span>
        </a>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {navItems.map(({ label, icon: Icon, active }) => (
            <a className={active ? "active" : ""} href="/" key={label}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <section className="inspiration-card" aria-label="Daily inspiration">
          <p className="eyebrow">Daily inspiration</p>
          <p>You do not have to be great to start, but you have to start to be great.</p>
          <span>Zig Ziglar</span>
        </section>

        <div className="profile-card">
          <span className="avatar">K</span>
          <span>
            <strong>Kiran</strong>
            <small>kiran@example.com</small>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </aside>

      <main className="app-shell">
        <section className="hero-band">
          <div>
            <h1>Good evening, Kiran!</h1>
            <p className="hero-copy">Let us turn your plans into progress.</p>
          </div>
          <div className="hero-date">
            <Calendar size={16} aria-hidden="true" />
            {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </div>
          <div className="stat-grid" aria-label="Todo summary">
            <span>
              <ListChecks size={24} aria-hidden="true" />
              <strong>{stats.total}</strong>
              total tasks
            </span>
            <span>
              <ClipboardList size={24} aria-hidden="true" />
              <strong>{stats.active}</strong>
              active
            </span>
            <span>
              <Check size={24} aria-hidden="true" />
              <strong>{stats.done}</strong>
              completed
            </span>
            <span>
              <CalendarCheck size={24} aria-hidden="true" />
              <strong>{stats.dueToday}</strong>
              due today
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
                placeholder="What needs to be done?"
              />
            </label>
            <label>
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Add context, a tiny plan, or the reason it matters..."
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
              Add task
            </button>
          </form>

          <section className="todo-panel" aria-label="Todo list">
            <div className="toolbar">
              <div className="search-box">
                <Search size={18} aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." />
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
                <span>Sort</span>
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
                    <div className="todo-meta">
                      <span className="category">{todo.category}</span>
                      <span className={`due-badge ${getDueStatus(todo)}`}>
                        <Calendar size={14} aria-hidden="true" />
                        {formatDueDate(todo.dueDate, todo.completed)}
                      </span>
                    </div>
                    <p>{todo.notes || "No notes yet."}</p>
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

            <div className="list-footer">
              <span>
                Showing {visibleTodos.length} of {todos.length} tasks
              </span>
              <button type="button" onClick={() => todos.filter((todo) => todo.completed).forEach((todo) => removeTodo(todo.id))}>
                Clear completed
              </button>
            </div>
          </section>

          <aside className="insight-panel">
            <section className="mini-panel focus-panel">
              <h2>
                <Target size={18} aria-hidden="true" />
                Today's Focus
              </h2>
              <div className="progress-ring" style={{ "--progress": `${stats.productivity * 3.6}deg` }}>
                <strong>{stats.productivity}%</strong>
                <span>Productive</span>
              </div>
              <p>Keep going. Small progress still counts.</p>
            </section>

            <section className="mini-panel">
              <h2>Categories</h2>
              <div className="category-chart" aria-hidden="true" />
              <div className="category-list">
                {(categoryRows.length ? categoryRows : [["Focus", 0]]).map(([category, count]) => (
                  <span key={category}>
                    <i />
                    {category}
                    <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </section>

            <section className="mini-panel">
              <h2>Quick Actions</h2>
              <button type="button">
                <Timer size={16} aria-hidden="true" />
                Focus Timer
              </button>
              <button type="button">
                <BarChart3 size={16} aria-hidden="true" />
                View Analytics
              </button>
            </section>
          </aside>
        </section>

        <p className="quote-strip">Small progress is still progress.</p>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
