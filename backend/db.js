// Very small file-based JSON "database".
// Good enough for learning CRUD concepts without needing a real database server.
const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "data", "blogs.json");

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
  }
} 

function readBlogs() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  try {
    return JSON.parse(raw); 
  } catch (err) {
    return [];
  }
}

function writeBlogs(blogs) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(blogs, null, 2));
}

module.exports = { readBlogs, writeBlogs };
