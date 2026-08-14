import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBlogs } from "../api";
import { formatDate, excerpt, entryNumber } from "../utils";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlogs()
      .then(setBlogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="empty-state">Loading entries…</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (blogs.length === 0) {
    return (
      <div className="empty-state">
        No entries yet. <Link to="/new">Write your first one →</Link>
      </div>
    );
  }

  return (
    <div className="entry-list">
      {blogs.map((blog, index) => (
        <article className="entry-row" key={blog.id}>
          <div className="entry-number">{entryNumber(index)}</div>
          <div>
            <div className="entry-meta">
              {formatDate(blog.updatedAt)} · {blog.author}
            </div>
            <h2 className="entry-title">
              <Link to={`/posts/${blog.id}`}>{blog.title}</Link>
            </h2>
            <p className="entry-excerpt">{excerpt(blog.content)}</p>
            {blog.tags && blog.tags.length > 0 && (
              <div className="tag-row">
                {blog.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
