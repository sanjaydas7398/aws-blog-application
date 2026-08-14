const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readBlogs, writeBlogs } = require("../db");

const router = express.Router();

// GET /api/blogs - list all blogs (most recent first)
router.get("/", (req, res) => {
  const blogs = readBlogs();
  const sorted = [...blogs].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
  res.json(sorted);
});

// GET /api/blogs/:id - read a single blog
router.get("/:id", (req, res) => {
  const blogs = readBlogs();
  const blog = blogs.find((b) => b.id === req.params.id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }
  res.json(blog);
});

// POST /api/blogs - create a new blog
router.post("/", (req, res) => {
  const { title, author, content, tags } = req.body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const blogs = readBlogs();
  const now = new Date().toISOString();

  const newBlog = {
    id: uuidv4(),
    title: title.trim(),
    author: author && author.trim() ? author.trim() : "Anonymous",
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: now,
    updatedAt: now,
  };

  blogs.push(newBlog);
  writeBlogs(blogs);

  res.status(201).json(newBlog);
});

// PUT /api/blogs/:id - update an existing blog
router.put("/:id", (req, res) => {
  const { title, author, content, tags } = req.body;
  const blogs = readBlogs();
  const index = blogs.findIndex((b) => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const existing = blogs[index];
  const updated = {
    ...existing,
    title: title.trim(),
    author: author && author.trim() ? author.trim() : existing.author,
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : existing.tags,
    updatedAt: new Date().toISOString(),
  };

  blogs[index] = updated;
  writeBlogs(blogs);

  res.json(updated);
});

// DELETE /api/blogs/:id - delete a blog
router.delete("/:id", (req, res) => {
  const blogs = readBlogs();
  const index = blogs.findIndex((b) => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  const [deleted] = blogs.splice(index, 1);
  writeBlogs(blogs);

  res.json({ message: "Blog deleted", blog: deleted });
});

module.exports = router;
