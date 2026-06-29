# Feature Documentation

## Todo List Page

The list page lives at `frontend/index.html`. It loads all todos from the Express API and presents them in a searchable workbench. Users can create a new task, filter the list, mark an item complete, delete an item, or open the detail page.

## Todo Detail Page

The detail page lives at `frontend/todo.html`. It expects a query parameter named `id`, for example:

```text
todo.html?id=morning-map
```

That id is used to fetch one todo from `/api/todos/:id`. The page supports editing the title, notes, category, priority, and completion status.

## Backend Behavior

The backend starts from `backend/index.js` and exposes JSON endpoints under `/api`. Todos are stored in `backend/data/todos.json`, which keeps the project simple while still preserving changes across server restarts.

## Data Shape

Each todo has this shape:

```json
{
  "id": "morning-map",
  "title": "Sketch the day before opening messages",
  "notes": "Pick the three tasks that would make today feel clean and intentional.",
  "category": "Focus",
  "priority": "high",
  "completed": false,
  "createdAt": "2026-06-28T00:00:00.000Z",
  "updatedAt": "2026-06-28T00:00:00.000Z"
}
```

## Validation

The API requires a non-empty title when creating or updating a todo. Priority is normalized to `low`, `medium`, or `high`. If no category is supplied, the backend uses `General`.
