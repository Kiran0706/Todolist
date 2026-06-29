import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Check, Save, Trash2 } from "lucide-react";
import { deleteTodo, getTodo, updateTodo } from "./api";
import "./styles.css";

function App() {
  const id = new URLSearchParams(window.location.search).get("id");
  const [todo, setTodo] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTodo() {
      if (!id) {
        setStatus("missing");
        return;
      }

      try {
        setTodo(await getTodo(id));
        setStatus("ready");
      } catch (error) {
        setMessage(error.message);
        setStatus("error");
      }
    }

    loadTodo();
  }, [id]);

  function updateField(field, value) {
    setTodo((currentTodo) => ({ ...currentTodo, [field]: value }));
  }

  async function saveTodo(event) {
    event.preventDefault();

    try {
      const savedTodo = await updateTodo(todo.id, todo);
      setTodo(savedTodo);
      setMessage("Saved. This task is up to date.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeTodo() {
    try {
      await deleteTodo(todo.id);
      window.location.href = "/";
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (status !== "ready") {
    return (
      <main className="app-shell detail-shell">
        <a className="back-link" href="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to list
        </a>
        <section className="detail-empty">
          <h1>{status === "loading" ? "Loading task" : "Task unavailable"}</h1>
          <p>{message || "The todo id was not provided in the page query."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell detail-shell">
      <a className="back-link" href="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to list
      </a>

      <form className="detail-board" onSubmit={saveTodo}>
        <section className="detail-intro">
          <p className="eyebrow">Todo detail</p>
          <input
            className="title-editor"
            value={todo.title}
            onChange={(event) => updateField("title", event.target.value)}
            aria-label="Todo title"
          />
          <p>
            Created {new Date(todo.createdAt).toLocaleDateString()} · Updated{" "}
            {new Date(todo.updatedAt).toLocaleDateString()}
          </p>
        </section>

        <section className="detail-fields">
          <label>
            Notes
            <textarea value={todo.notes} onChange={(event) => updateField("notes", event.target.value)} />
          </label>
          <div className="form-row">
            <label>
              Category
              <input value={todo.category} onChange={(event) => updateField("category", event.target.value)} />
            </label>
            <label>
              Priority
              <select value={todo.priority} onChange={(event) => updateField("priority", event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label className="toggle-row">
            <input
              checked={todo.completed}
              onChange={(event) => updateField("completed", event.target.checked)}
              type="checkbox"
            />
            <span>
              <Check size={18} aria-hidden="true" />
              Completed
            </span>
          </label>
        </section>

        {message ? <p className="save-note">{message}</p> : null}

        <div className="detail-actions">
          <button className="primary-button" type="submit">
            <Save size={18} aria-hidden="true" />
            Save changes
          </button>
          <button className="danger-button" onClick={removeTodo} type="button">
            <Trash2 size={18} aria-hidden="true" />
            Delete task
          </button>
        </div>
      </form>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
