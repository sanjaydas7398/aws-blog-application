import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BlogForm from "../components/BlogForm";
import { fetchBlog, updateBlog } from "../api";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlog(id)
      .then(setBlog)
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleUpdate(payload) {
    await updateBlog(id, payload);
    navigate(`/posts/${id}`);
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!blog) {
    return <p className="empty-state">Loading…</p>;
  }

  return (
    <div>
      <Link to={`/posts/${id}`} className="back-link">
        ← Back to entry
      </Link>
      <div className="page-heading">Edit Entry</div>
      <BlogForm
        initialValues={blog}
        onSubmit={handleUpdate}
        submitLabel="Save changes"
      />
    </div>
  );
}
