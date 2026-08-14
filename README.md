# Ledger — a simple full-stack blog app

A learning-friendly blog application with full **Create, Read, Update, Delete**
functionality, built with:

- **Backend:** Node.js + Express, storing posts in a local JSON file (no database
  server required, so you can focus on learning the CRUD logic first)
- **Frontend:** React (Vite) + React Router

## Project structure

```
blog-app/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js               # Simple JSON file read/write helpers
│   ├── routes/blogs.js     # CRUD routes: GET, POST, PUT, DELETE
│   └── data/blogs.json     # Where your blog posts are stored
│
└── frontend/
    └── src/
        ├── App.jsx          # Routes
        ├── api.js           # Functions that call the backend API
        ├── components/      # Header, BlogForm
        └── pages/           # BlogList, BlogDetail, NewBlog, EditBlog
```

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

This starts the API at **http://localhost:5000**. You can test it directly:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/blogs
```

## 2. Run the frontend 

Open a **second terminal** (keep the backend running):

```bash 
cd frontend
npm install
npm run dev
```

This starts the React app at **http://localhost:5173**. Open that URL in your
browser — the Vite dev server is already configured to forward `/api` requests
to your backend on port 5000, so there's nothing else to configure.

## API endpoints (backend)

| Method | Endpoint            | What it does           |
|--------|----------------------|-------------------------|
| GET    | /api/blogs           | List all blog posts     |
| GET    | /api/blogs/:id        | Get a single post       |
| POST   | /api/blogs           | Create a new post        |
| PUT    | /api/blogs/:id        | Update an existing post |
| DELETE | /api/blogs/:id        | Delete a post            |

## How the pieces connect (for learning)

```
Browser (React)
   │  fetch("/api/blogs")
   ▼
Vite Dev Server (port 5173)
   │  proxies /api/* requests
   ▼
Express Server (port 5000)
   │  reads/writes
   ▼
backend/data/blogs.json
```

## Next steps once you're comfortable with this

- Swap the JSON file for a real database (start with **SQLite**, then try
  **AWS RDS** once you're deploying to the cloud)
- Add user authentication (login/signup) so posts are tied to real accounts
- Deploy the backend to your **EC2 instance** and the frontend as a static
  build (`npm run build` in `frontend/`) served via **S3 + CloudFront**, or
  serve both from the same EC2 box behind Nginx
- Containerize both apps with **Docker** — you already have Docker experience
  from your EC2 practice, so this is a natural next step
