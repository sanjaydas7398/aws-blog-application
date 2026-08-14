import { useState } from "react";

export default function BlogForm({ initialValues, onSubmit, submitLabel }) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [author, setAuthor] = useState(initialValues?.author || "");
  const [content, setContent] = useState(initialValues?.content || "");
  const [tagsInput, setTagsInput] = useState(
    (initialValues?.tags || []).join(", ")
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      await onSubmit({ title, author, content, tags });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <input
          className="form-input form-title-input"
          placeholder="Entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Author</label>
        <input
          className="form-input"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-textarea"
          placeholder="Write your entry…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tags (comma separated)</label>
        <input
          className="form-input"
          placeholder="aws, learning, notes"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
