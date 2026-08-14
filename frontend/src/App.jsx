import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import NewBlog from "./pages/NewBlog";
import EditBlog from "./pages/EditBlog";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/new" element={<NewBlog />} />
        <Route path="/posts/:id" element={<BlogDetail />} />
        <Route path="/posts/:id/edit" element={<EditBlog />} />
      </Routes>
    </div>
  );
}
