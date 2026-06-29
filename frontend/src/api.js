const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getTodos() {
  return request("/todos");
}

export function getTodo(id) {
  return request(`/todos/${id}`);
}

export function createTodo(todo) {
  return request("/todos", {
    method: "POST",
    body: JSON.stringify(todo)
  });
}

export function updateTodo(id, todo) {
  return request(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todo)
  });
}

export function deleteTodo(id) {
  return request(`/todos/${id}`, {
    method: "DELETE"
  });
}
