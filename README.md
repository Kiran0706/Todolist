# Todo Atelier

Todo Atelier is a two-page React todo application with a Node.js and Express API. It was built for the challenge brief: a list page, a detail page that reads a todo id from the query string, full CRUD endpoints, and file-based persistence.

## Features

- Add todos with a title, notes, category, priority, and completion state.
- Search todos and filter by all, active, or done.
- Open a dedicated detail page with `todo.html?id=<todo-id>`.
- Edit every field from the detail page.
- Mark tasks complete from the list or detail view.
- Delete tasks from either page.
- Persist data in `backend/data/todos.json`.
- Use separate HTML entry points instead of a single-page router.

## Tech Stack

- Frontend: React, Vite, lucide-react, CSS
- Backend: Node.js, Express, CORS
- Storage: JSON file on disk

## Run Locally

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

Install and start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check whether the API is running |
| `GET` | `/api/todos` | List all todos |
| `GET` | `/api/todos/:id` | Read one todo |
| `POST` | `/api/todos` | Create a todo |
| `PUT` | `/api/todos/:id` | Update a todo |
| `PATCH` | `/api/todos/:id` | Partially update a todo |
| `DELETE` | `/api/todos/:id` | Delete a todo |

## Project Notes

The UI uses original copy, layout, and styling so the application does not look like a stock todo tutorial. The first page is a workbench for capture and scanning; the second page is a focused editor for one task.
