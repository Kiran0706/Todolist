# Todo Atelier

Todo Atelier is a full-stack todo dashboard for planning daily work, tracking task progress, and keeping a simple personal productivity record. It is built with a React frontend and an Express backend. The backend stores todos in a local JSON file, so the project can run without setting up an external database.

## Project Purpose

This project was made to turn a basic todo list into a more complete task workspace. A user can create tasks, update them, mark them as complete, sort and search their list, view tasks by date or category, and use small dashboard panels to understand their progress.

## Tech Stack

- Frontend: React, Vite, lucide-react icons, CSS
- Backend: Node.js, Express, CORS
- Storage: JSON file at `backend/data/todos.json`
- API style: REST endpoints under `/api`

## Folder Structure

```text
todo-app/
  backend/
    data/todos.json
    index.js
    package.json
  frontend/
    src/
      api.js
      detail.jsx
      list.jsx
      styles.css
    index.html
    todo.html
    package.json
  FEATURES.md
  README.md
```

## How To Run

Open two terminals from the project folder.

Start the backend:

```bash
cd backend
npm install
npm start
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

The frontend runs on the Vite URL shown in the terminal, usually `http://127.0.0.1:5173`.

## Main Screens

The main dashboard is loaded from `frontend/index.html`. It contains the sidebar, dashboard view, task composer, task list, category section, timer section, analytics section, and settings section.

The task detail page is loaded from `frontend/todo.html?id=TASK_ID`. It opens one selected task and allows the user to edit or delete it separately.

## Core Functionality

- Create a todo with title, notes, category, priority, and due date.
- View all saved todos from the backend.
- Search tasks by title, notes, or category.
- Filter tasks by all, active, or completed status.
- Sort tasks by newest, due date, priority, or active-first order.
- Mark a task as completed or restore it back to active.
- Edit task details directly from the task cards.
- Delete tasks from the list or detail page.
- View tasks that are due today, overdue, upcoming, or completed.
- Group and review tasks by category.
- Use a focus timer with focus and break lengths.
- See dashboard statistics such as total tasks, active tasks, completed tasks, due-today tasks, overdue tasks, weekly completed tasks, productivity percentage, and focus time.
- Change simple workspace preferences such as profile name, theme choice, language choice, notification toggle, and backup toggle.

## Backend API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check whether the API is running. |
| `GET` | `/api/todos` | Return all todos. |
| `GET` | `/api/todos/:id` | Return one todo by id. |
| `POST` | `/api/todos` | Create a new todo. |
| `PUT` | `/api/todos/:id` | Replace/update an existing todo. |
| `PATCH` | `/api/todos/:id` | Partially update an existing todo. |
| `DELETE` | `/api/todos/:id` | Delete a todo. |

## Todo Data Format

Each todo is saved with this structure:

```json
{
  "id": "assignment-mqz509gu",
  "title": "Assignment",
  "notes": "Write DBA Assignment",
  "category": "Focus",
  "priority": "high",
  "dueDate": "",
  "completed": true,
  "createdAt": "2026-06-29T11:31:17.357Z",
  "updatedAt": "2026-06-29T11:43:43.216Z"
}
```

## Validation And Error Handling

The backend checks that every todo has a title before it is saved. Priority is limited to `low`, `medium`, or `high`. Due dates are stored as an empty string or in `YYYY-MM-DD` format. If a requested todo does not exist, the API returns a `404` response.

The frontend shows loading, empty, and error states so the user knows what is happening instead of seeing a blank page.

## Notes

This documentation is written specifically for this repository and its current implementation. It explains the actual features available in the app rather than using copied project-description text.
