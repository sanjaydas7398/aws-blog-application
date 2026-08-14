import { Link, useNavigate } from "react-router-dom";
import BlogForm from "../components/BlogForm";
import { createBlog } from "../api";

export default function NewBlog() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    const blog = await createBlog(payload);
    navigate(`/posts/${blog.id}`);
  }

  return (
    <div>
      <Link to="/" className="back-link">
        ← Back to entries
      </Link>
      <div className="page-heading">New Entry</div>
      <BlogForm onSubmit={handleCreate} submitLabel="Publish entry" />
    </div>
  );
}
