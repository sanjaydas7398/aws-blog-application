const BASE_URL = "/api/blogs";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export async function fetchBlogs() {
  const res = await fetch(BASE_URL);
  return handleResponse(res);
}

export async function fetchBlog(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return handleResponse(res);
}

export async function createBlog(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateBlog(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteBlog(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
