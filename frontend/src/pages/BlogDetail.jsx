import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchBlog, deleteBlog } from "../api";
import { formatDate } from "../utils";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBlog(id)
      .then(setBlog)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBlog(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <>
        <Link to="/" className="back-link">
          ← Back to entries
        </Link>
        <p className="form-error">{error}</p>
      </>
    );
  }

  if (!blog) {
    return <p className="empty-state">Loading…</p>;
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to entries
      </Link>

      <h1 className="post-detail-title">{blog.title}</h1>
      <div className="post-detail-meta">
        By {blog.author} · Published {formatDate(blog.createdAt)}
        {blog.updatedAt !== blog.createdAt &&
          ` · Updated ${formatDate(blog.updatedAt)}`}
      </div>

      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={blog.title}
          style={{ maxWidth: "100%", maxHeight: 400, marginTop: 16, borderRadius: 8 }}
        />
      )}

      <div className="post-detail-content">{blog.content}</div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: 28 }}>
          {blog.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-actions">
        <Link to={`/posts/${blog.id}/edit`} className="btn">
          Edit
        </Link>

        {!confirmingDelete ? (
          <button
            className="btn btn-danger"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        ) : (
          <div className="confirm-bar">
            Delete this entry permanently?
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button className="btn" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
