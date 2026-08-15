const BASE_URL = "/api/blogs";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

function buildFormData(payload) {
  const form = new FormData();
  if (payload.title) form.append("title", payload.title);
  if (payload.author) form.append("author", payload.author);
  if (payload.content) form.append("content", payload.content);
  if (payload.tags) form.append("tags", JSON.stringify(payload.tags));
  if (payload.imageFile) form.append("image", payload.imageFile);
  return form;
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
  console.log("API createBlog called with:", payload);
  const form = buildFormData(payload);
  console.log("FormData created, sending POST to", BASE_URL);
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: form,
  });
  console.log("Response status:", res.status);
  return handleResponse(res);
}

export async function updateBlog(id, payload) {
  console.log("API updateBlog called for id:", id, payload);
  const form = buildFormData(payload);
  console.log("FormData created, sending PUT to", `${BASE_URL}/${id}`);
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: form,
  });
  console.log("Response status:", res.status);
  return handleResponse(res);
}

export async function deleteBlog(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
