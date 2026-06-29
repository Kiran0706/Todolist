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
  Download,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Upload
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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "My Tasks", icon: ClipboardList },
  { id: "today", label: "Today", icon: Calendar },
  { id: "upcoming", label: "Upcoming", icon: CalendarCheck },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "categories", label: "Categories", icon: FolderKanban },
  { id: "timer", label: "Focus Timer", icon: Timer },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings }
];

const starterCategories = ["Study", "Work", "Personal", "Health", "Shopping", "Focus"];

function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
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
  const tomorrow = addDays(today, 1);
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

function formatCompletionDate(todo) {
  const completedAt = todo.updatedAt || todo.createdAt;

  if (!completedAt) {
    return "Completion date unavailable";
  }

  return `Completed ${new Date(completedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function getWeekKey(dateValue) {
  const date = new Date(dateValue);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
}

function TaskCard({
  todo,
  editing,
  editDraft,
  onChangeDraft,
  onDelete,
  onEdit,
  onSave,
  onToggle,
  showCompletedDate = false,
  showRestore = false
}) {
  return (
    <article className={`todo-card ${todo.completed ? "completed" : ""}`}>
      <button
        className="check-button"
        onClick={() => onToggle(todo)}
        type="button"
        aria-label={todo.completed ? "Mark active" : "Mark complete"}
      >
        {todo.completed ? <Check size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
      </button>

      <div className="todo-main">
        {editing ? (
          <div className="edit-grid">
            <input
              value={editDraft.title}
              onChange={(event) => onChangeDraft({ ...editDraft, title: event.target.value })}
              aria-label="Task title"
            />
            <div className="form-row">
              <input
                value={editDraft.category}
                onChange={(event) => onChangeDraft({ ...editDraft, category: event.target.value })}
                aria-label="Task category"
              />
              <select
                value={editDraft.priority}
                onChange={(event) => onChangeDraft({ ...editDraft, priority: event.target.value })}
                aria-label="Task priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <input
              value={editDraft.dueDate}
              onChange={(event) => onChangeDraft({ ...editDraft, dueDate: event.target.value })}
              type="date"
              aria-label="Task due date"
            />
            <textarea
              value={editDraft.notes}
              onChange={(event) => onChangeDraft({ ...editDraft, notes: event.target.value })}
              aria-label="Task notes"
            />
          </div>
        ) : (
          <>
            <div className="todo-line">
              <h3>{todo.title}</h3>
              <span className={`priority ${todo.priority}`}>{todo.priority}</span>
            </div>
            <div className="todo-meta">
              <span className="category">{todo.category}</span>
              <span className={`due-badge ${getDueStatus(todo)}`}>
                <Calendar size={14} aria-hidden="true" />
                {showCompletedDate ? formatCompletionDate(todo) : formatDueDate(todo.dueDate, todo.completed)}
              </span>
            </div>
            <p>{todo.notes || "No notes yet."}</p>
          </>
        )}
      </div>

      {editing ? (
        <button className="icon-link" onClick={() => onSave(todo)} type="button" aria-label="Save task">
          <Save size={18} aria-hidden="true" />
        </button>
      ) : (
        <button className="icon-link" onClick={() => (showRestore ? onToggle(todo) : onEdit(todo))} type="button" aria-label={showRestore ? "Restore task" : "Edit task"}>
          {showRestore ? <RotateCcw size={18} aria-hidden="true" /> : <Pencil size={18} aria-hidden="true" />}
        </button>
      )}

      <button className="ghost-button" onClick={() => onDelete(todo.id)} type="button" aria-label="Delete todo">
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </article>
  );
}

function TaskList({
  todos,
  emptyText,
  editingId,
  editDraft,
  onChangeDraft,
  onDelete,
  onEdit,
  onSave,
  onToggle,
  showCompletedDate,
  showRestore
}) {
  if (!todos.length) {
    return <p className="quiet-state">{emptyText}</p>;
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TaskCard
          editDraft={editDraft}
          editing={editingId === todo.id}
          key={todo.id}
          onChangeDraft={onChangeDraft}
          onDelete={onDelete}
          onEdit={onEdit}
          onSave={onSave}
          onToggle={onToggle}
          showCompletedDate={showCompletedDate}
          showRestore={showRestore}
          todo={todo}
        />
      ))}
    </div>
  );
}

function SectionHeader({ eyebrow, title, children }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(blankTodo);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [editingId, setEditingId] = useState("");
  const [editDraft, setEditDraft] = useState(blankTodo);
  const [customCategories, setCustomCategories] = useState(starterCategories);
  const [newCategory, setNewCategory] = useState("");
  const [timerMode, setTimerMode] = useState("focus");
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [settingsForm, setSettingsForm] = useState({
    theme: "Light",
    language: "English",
    notifications: true,
    backup: true,
    profile: "Kiran"
  });

  useEffect(() => {
    loadTodos();

    window.addEventListener("focus", loadTodos);
    window.addEventListener("pageshow", loadTodos);

    return () => {
      window.removeEventListener("focus", loadTodos);
      window.removeEventListener("pageshow", loadTodos);
    };
  }, []);

  useEffect(() => {
    if (!timerRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds > 1) {
          return currentSeconds - 1;
        }

        const nextMode = timerMode === "focus" ? "break" : "focus";
        setSessions((currentSessions) =>
          timerMode === "focus" ? [{ startedAt: new Date().toISOString(), minutes: timerMinutes }, ...currentSessions] : currentSessions
        );
        setTimerMode(nextMode);
        return (nextMode === "focus" ? timerMinutes : breakMinutes) * 60;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [breakMinutes, timerMinutes, timerMode, timerRunning]);

  useEffect(() => {
    setSecondsLeft((timerMode === "focus" ? timerMinutes : breakMinutes) * 60);
  }, [breakMinutes, timerMinutes, timerMode]);

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
      setCustomCategories((currentCategories) =>
        currentCategories.includes(createdTodo.category) ? currentCategories : [...currentCategories, createdTodo.category]
      );
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
      const savedTodo = await updateTodo(todo.id, updatedTodo);
      setTodos((currentTodos) => currentTodos.map((item) => (item.id === todo.id ? savedTodo : item)));
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

  function startEditing(todo) {
    setEditingId(todo.id);
    setEditDraft({
      title: todo.title,
      notes: todo.notes || "",
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate || "",
      completed: todo.completed
    });
  }

  async function saveEdit(todo) {
    if (!editDraft.title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    const updatedTodo = { ...todo, ...editDraft };
    setTodos((currentTodos) => currentTodos.map((item) => (item.id === todo.id ? updatedTodo : item)));

    try {
      const savedTodo = await updateTodo(todo.id, updatedTodo);
      setTodos((currentTodos) => currentTodos.map((item) => (item.id === todo.id ? savedTodo : item)));
      setEditingId("");
      setError("");
    } catch (err) {
      setError(err.message);
      loadTodos();
    }
  }

  function addCategory(event) {
    event.preventDefault();
    const category = newCategory.trim();

    if (!category || customCategories.includes(category)) {
      return;
    }

    setCustomCategories((currentCategories) => [...currentCategories, category]);
    setNewCategory("");
  }

  function resetTimer() {
    setTimerRunning(false);
    setSecondsLeft((timerMode === "focus" ? timerMinutes : breakMinutes) * 60);
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

  const todayTodos = useMemo(() => {
    const today = getToday();
    return todos
      .filter((todo) => todo.dueDate && !todo.completed)
      .filter((todo) => {
        const due = new Date(`${todo.dueDate}T00:00:00`);
        return due < today || isSameDay(due, today);
      })
      .sort((firstTodo, secondTodo) => getDateValue(firstTodo.dueDate) - getDateValue(secondTodo.dueDate));
  }, [todos]);

  const upcomingGroups = useMemo(() => {
    const today = getToday();
    const tomorrow = addDays(today, 1);
    const thisWeekEnd = addDays(today, 7);
    const nextWeekEnd = addDays(today, 14);
    const groups = {
      Tomorrow: [],
      "This Week": [],
      "Next Week": [],
      Later: []
    };

    todos
      .filter((todo) => todo.dueDate && !todo.completed)
      .sort((firstTodo, secondTodo) => getDateValue(firstTodo.dueDate) - getDateValue(secondTodo.dueDate))
      .forEach((todo) => {
        const due = new Date(`${todo.dueDate}T00:00:00`);

        if (due <= today) {
          return;
        }

        if (isSameDay(due, tomorrow)) {
          groups.Tomorrow.push(todo);
        } else if (due <= thisWeekEnd) {
          groups["This Week"].push(todo);
        } else if (due <= nextWeekEnd) {
          groups["Next Week"].push(todo);
        } else {
          groups.Later.push(todo);
        }
      });

    return groups;
  }, [todos]);

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).sort((firstTodo, secondTodo) => new Date(secondTodo.updatedAt) - new Date(firstTodo.updatedAt)),
    [todos]
  );

  const categoryRows = useMemo(() => {
    const counts = todos.reduce((summary, todo) => {
      summary[todo.category] = (summary[todo.category] || 0) + 1;
      return summary;
    }, {});
    const categorySet = new Set([...customCategories, ...Object.keys(counts)]);

    return [...categorySet]
      .map((category) => [category, counts[category] || 0])
      .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]));
  }, [customCategories, todos]);

  const stats = useMemo(() => {
    const today = getToday();
    const done = todos.filter((todo) => todo.completed).length;
    const dueToday = todos.filter((todo) => todo.dueDate && isSameDay(new Date(`${todo.dueDate}T00:00:00`), today)).length;
    const overdue = todos.filter((todo) => getDueStatus(todo) === "overdue").length;
    const weeklyDone = todos.filter((todo) => todo.completed && todo.updatedAt && getWeekKey(new Date(todo.updatedAt)) === getWeekKey(new Date())).length;

    return {
      total: todos.length,
      done,
      active: todos.length - done,
      dueToday,
      overdue,
      weeklyDone,
      productivity: todos.length ? Math.round((done / todos.length) * 100) : 0,
      focusTime: sessions.reduce((total, session) => total + session.minutes, 0)
    };
  }, [sessions, todos]);

  const recentTodos = useMemo(() => [...todos].sort((firstTodo, secondTodo) => new Date(secondTodo.updatedAt) - new Date(firstTodo.updatedAt)).slice(0, 4), [todos]);
  const topCategories = categoryRows.slice(0, 5);
  const timerText = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  function renderTaskControls() {
    return (
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." />
        </div>
        <div className="segments" aria-label="Filter todos">
          {["all", "active", "done"].map((option) => (
            <button className={filter === option ? "active" : ""} key={option} onClick={() => setFilter(option)} type="button">
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
    );
  }

  function renderComposer() {
    return (
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
              list="category-options"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="Focus"
            />
            <datalist id="category-options">
              {categoryRows.map(([category]) => (
                <option key={category} value={category} />
              ))}
            </datalist>
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
          <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} type="date" />
        </label>
        {error ? <p className="error-note">{error}</p> : null}
        <button className="primary-button" type="submit">
          <Plus size={18} aria-hidden="true" />
          Add task
        </button>
      </form>
    );
  }

  function renderInsights() {
    return (
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
            {(topCategories.length ? topCategories : [["Focus", 0]]).map(([category, count]) => (
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
          <button type="button" onClick={() => setActiveView("timer")}>
            <Timer size={16} aria-hidden="true" />
            Focus Timer
          </button>
          <button type="button" onClick={() => setActiveView("analytics")}>
            <BarChart3 size={16} aria-hidden="true" />
            View Analytics
          </button>
        </section>
      </aside>
    );
  }

  function renderDashboard() {
    return (
      <section className="workspace">
        {renderComposer()}
        <section className="todo-panel" aria-label="Recent tasks">
          <SectionHeader eyebrow="Home" title="Recent Tasks">
            <a className="text-link" href="/todo.html">
              <ArrowUpRight size={16} aria-hidden="true" />
              Details
            </a>
          </SectionHeader>
          {status === "loading" ? <p className="quiet-state">Loading your list...</p> : null}
          {status === "error" ? <p className="quiet-state">Start the backend, then refresh this page.</p> : null}
          {status === "ready" ? (
            <TaskList
              editDraft={editDraft}
              editingId={editingId}
              emptyText="No recent tasks yet."
              onChangeDraft={setEditDraft}
              onDelete={removeTodo}
              onEdit={startEditing}
              onSave={saveEdit}
              onToggle={toggleTodo}
              todos={recentTodos}
            />
          ) : null}
          <div className="list-footer">
            <span>{stats.overdue ? `${stats.overdue} overdue` : "No overdue tasks"}</span>
            <button type="button" onClick={() => setActiveView("tasks")}>
              View all tasks
            </button>
          </div>
        </section>
        {renderInsights()}
      </section>
    );
  }

  function renderTasks() {
    return (
      <section className="content-grid two-column">
        {renderComposer()}
        <section className="todo-panel" aria-label="My tasks">
          <SectionHeader eyebrow="My Tasks" title="All Tasks" />
          {renderTaskControls()}
          <TaskList
            editDraft={editDraft}
            editingId={editingId}
            emptyText="No tasks match this view."
            onChangeDraft={setEditDraft}
            onDelete={removeTodo}
            onEdit={startEditing}
            onSave={saveEdit}
            onToggle={toggleTodo}
            todos={visibleTodos}
          />
          <div className="list-footer">
            <span>
              Showing {visibleTodos.length} of {todos.length} tasks
            </span>
            <button type="button" onClick={() => todos.filter((todo) => todo.completed).forEach((todo) => removeTodo(todo.id))}>
              Clear completed
            </button>
          </div>
        </section>
      </section>
    );
  }

  function renderToday() {
    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Today" title="Due Today And Overdue" />
        {stats.overdue ? <p className="warning-note">{stats.overdue} overdue task{stats.overdue === 1 ? "" : "s"} need attention first.</p> : null}
        <TaskList
          editDraft={editDraft}
          editingId={editingId}
          emptyText="Nothing due today."
          onChangeDraft={setEditDraft}
          onDelete={removeTodo}
          onEdit={startEditing}
          onSave={saveEdit}
          onToggle={toggleTodo}
          todos={todayTodos}
        />
      </section>
    );
  }

  function renderUpcoming() {
    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Upcoming" title="Future Tasks" />
        <div className="group-stack">
          {Object.entries(upcomingGroups).map(([label, groupTodos]) => (
            <section className="task-group" key={label}>
              <h3>{label}</h3>
              <TaskList
                editDraft={editDraft}
                editingId={editingId}
                emptyText={`No tasks in ${label.toLowerCase()}.`}
                onChangeDraft={setEditDraft}
                onDelete={removeTodo}
                onEdit={startEditing}
                onSave={saveEdit}
                onToggle={toggleTodo}
                todos={groupTodos}
              />
            </section>
          ))}
        </div>
      </section>
    );
  }

  function renderCompleted() {
    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Completed" title="Finished Tasks" />
        <TaskList
          editDraft={editDraft}
          editingId={editingId}
          emptyText="Completed tasks will appear here."
          onChangeDraft={setEditDraft}
          onDelete={removeTodo}
          onEdit={startEditing}
          onSave={saveEdit}
          onToggle={toggleTodo}
          showCompletedDate
          showRestore
          todos={completedTodos}
        />
      </section>
    );
  }

  function renderCategories() {
    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Categories" title="Task Categories" />
        <form className="inline-form" onSubmit={addCategory}>
          <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Add category" />
          <button className="primary-button" type="submit">
            <Plus size={18} aria-hidden="true" />
            Add
          </button>
        </form>
        <div className="category-grid">
          {categoryRows.map(([category, count]) => (
            <article className="category-tile" key={category}>
              <span>
                <FolderKanban size={18} aria-hidden="true" />
                {category}
              </span>
              <strong>{count}</strong>
              <button
                disabled={count > 0}
                onClick={() => setCustomCategories((currentCategories) => currentCategories.filter((item) => item !== category))}
                type="button"
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderTimer() {
    return (
      <section className="content-grid two-column">
        <section className="view-panel timer-panel">
          <SectionHeader eyebrow="Focus Timer" title={timerMode === "focus" ? "Focus Session" : "Break Time"} />
          <div className="timer-face">{timerText}</div>
          <div className="timer-actions">
            <button className="primary-button" onClick={() => setTimerRunning((running) => !running)} type="button">
              <Timer size={18} aria-hidden="true" />
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button className="danger-button" onClick={resetTimer} type="button">
              <RotateCcw size={18} aria-hidden="true" />
              Reset
            </button>
          </div>
          <div className="settings-grid">
            <label>
              Focus minutes
              <input min="1" max="90" type="number" value={timerMinutes} onChange={(event) => setTimerMinutes(Number(event.target.value) || 25)} />
            </label>
            <label>
              Break minutes
              <input min="1" max="30" type="number" value={breakMinutes} onChange={(event) => setBreakMinutes(Number(event.target.value) || 5)} />
            </label>
          </div>
        </section>
        <section className="view-panel">
          <SectionHeader eyebrow="Sessions" title="Focus History" />
          <div className="metric-grid">
            <span>
              <strong>{sessions.length}</strong>
              sessions
            </span>
            <span>
              <strong>{stats.focusTime}</strong>
              minutes
            </span>
          </div>
          <div className="activity-list">
            {(sessions.length ? sessions : [{ startedAt: new Date().toISOString(), minutes: 0 }]).map((session, index) => (
              <span key={`${session.startedAt}-${index}`}>
                <Clock3 size={16} aria-hidden="true" />
                {session.minutes ? `${session.minutes} minute focus block` : "No focus sessions yet"}
              </span>
            ))}
          </div>
        </section>
      </section>
    );
  }

  function renderAnalytics() {
    const chartRows = topCategories.length ? topCategories : [["Focus", 0]];
    const maxCount = Math.max(...chartRows.map(([, count]) => count), 1);

    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Analytics" title="Productivity Dashboard" />
        <div className="metric-grid">
          <span>
            <strong>{stats.done}</strong>
            completed
          </span>
          <span>
            <strong>{stats.weeklyDone}</strong>
            this week
          </span>
          <span>
            <strong>{stats.focusTime}</strong>
            focus min
          </span>
          <span>
            <strong>{stats.productivity}%</strong>
            productivity
          </span>
        </div>
        <div className="bar-chart">
          {chartRows.map(([category, count]) => (
            <span key={category}>
              <em>{category}</em>
              <i style={{ "--bar-width": `${Math.max((count / maxCount) * 100, 4)}%` }} />
              <strong>{count}</strong>
            </span>
          ))}
        </div>
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className="view-panel">
        <SectionHeader eyebrow="Settings" title="Workspace Preferences" />
        <div className="settings-grid">
          <label>
            Profile name
            <input value={settingsForm.profile} onChange={(event) => setSettingsForm({ ...settingsForm, profile: event.target.value })} />
          </label>
          <label>
            Theme
            <select value={settingsForm.theme} onChange={(event) => setSettingsForm({ ...settingsForm, theme: event.target.value })}>
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </label>
          <label>
            Language
            <select value={settingsForm.language} onChange={(event) => setSettingsForm({ ...settingsForm, language: event.target.value })}>
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
            </select>
          </label>
          <label className="toggle-setting">
            <input
              checked={settingsForm.notifications}
              onChange={(event) => setSettingsForm({ ...settingsForm, notifications: event.target.checked })}
              type="checkbox"
            />
            Notifications
          </label>
          <label className="toggle-setting">
            <input checked={settingsForm.backup} onChange={(event) => setSettingsForm({ ...settingsForm, backup: event.target.checked })} type="checkbox" />
            Automatic backup
          </label>
        </div>
        <div className="timer-actions">
          <button className="primary-button" type="button">
            <Download size={18} aria-hidden="true" />
            Export tasks
          </button>
          <button className="danger-button" type="button">
            <Upload size={18} aria-hidden="true" />
            Import tasks
          </button>
        </div>
      </section>
    );
  }

  function renderActiveView() {
    if (activeView === "tasks") return renderTasks();
    if (activeView === "today") return renderToday();
    if (activeView === "upcoming") return renderUpcoming();
    if (activeView === "completed") return renderCompleted();
    if (activeView === "categories") return renderCategories();
    if (activeView === "timer") return renderTimer();
    if (activeView === "analytics") return renderAnalytics();
    if (activeView === "settings") return renderSettings();
    return renderDashboard();
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <button className="brand" onClick={() => setActiveView("dashboard")} type="button">
          <span className="brand-mark">
            <Check size={22} aria-hidden="true" />
          </span>
          <span>Todo Atelier</span>
        </button>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button className={activeView === id ? "active" : ""} onClick={() => setActiveView(id)} type="button" key={id}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="inspiration-card" aria-label="Daily inspiration">
          <p className="eyebrow">Daily inspiration</p>
          <p>You do not have to be great to start, but you have to start to be great.</p>
          <span>Zig Ziglar</span>
        </section>

        <div className="profile-card">
          <span className="avatar">{settingsForm.profile.charAt(0) || "K"}</span>
          <span>
            <strong>{settingsForm.profile || "Kiran"}</strong>
            <small>kiran@example.com</small>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </div>
      </aside>

      <main className="app-shell">
        <section className="hero-band">
          <div>
            <h1>Good evening, {settingsForm.profile || "Kiran"}!</h1>
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

        {renderActiveView()}

        <p className="quote-strip">Small progress is still progress.</p>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
