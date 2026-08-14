const express = require("express");
const cors = require("cors");
const blogRoutes = require("./routes/blogs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/blogs", blogRoutes);

app.listen(PORT, () => {
  console.log(`Blog API running on http://localhost:${PORT}`);
});
