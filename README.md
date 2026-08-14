# Ledger — Full-Stack Blog App

A learning-friendly blog application with full **Create, Read, Update, Delete**
functionality, built with:

- **Backend:** Node.js + Express, storing posts in a local JSON file
- **Frontend:** React (Vite) + React Router

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Docker (Recommended for Deployment)](#docker-recommended-for-deployment)
5. [Deploy on AWS EC2](#deploy-on-aws-ec2)
6. [API Reference](#api-reference)

---

## Project Structure

```
blog-app/
├── backend/
│   ├── Dockerfile              # Backend Docker image
│   ├── server.js               # Express app entry point
│   ├── db.js                   # JSON file read/write helpers
│   ├── routes/blogs.js         # CRUD routes
│   ├── data/blogs.json         # Blog posts storage
│   └── package.json
│
├── frontend/
│   ├── Dockerfile              # Frontend Docker image
│   ├── nginx.conf              # Nginx config for serving React + API proxy
│   ├── vite.config.js          # Vite dev config
│   ├── src/
│   │   ├── App.jsx             # Routes
│   │   ├── api.js              # API calls
│   │   ├── components/         # Header, BlogForm
│   │   └── pages/              # BlogList, BlogDetail, NewBlog, EditBlog
│   └── package.json
│
├── docker-compose.yml          # Run both services together
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Docker** >= 24 (for containerized deployment)
- **Git**

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/blog-app.git
cd blog-app
```

### 2. Run the backend

```bash
cd backend
npm install
npm start
```

The API starts at **http://localhost:5000**. Test it:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/blogs
```

### 3. Run the frontend

Open a second terminal (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

The React app starts at **http://localhost:5173**. The Vite dev server
automatically proxies `/api/*` requests to the backend on port 5000.

---

## Docker (Recommended for Deployment)

### Why Docker?

- Same environment everywhere (your laptop, EC2, production)
- No need to install Node.js on the server
- One command to start everything

### Files included

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Builds the backend image |
| `frontend/Dockerfile` | Builds the frontend image and serves via Nginx |
| `frontend/nginx.conf` | Nginx config: serves React static files, proxies `/api` to backend |
| `docker-compose.yml` | Starts both services together |

### Build and run locally

```bash
docker-compose up --build
```

- Frontend: **http://localhost:80**
- Backend API: **http://localhost:5000**

To stop:

```bash
docker-compose down
```

> **Note:** Blog posts are stored in a Docker volume (`backend_data`) so
> data persists between container restarts.

---

## Deploy on AWS EC2

This section is for DevOps engineers. Follow these steps to deploy the
application on an AWS EC2 instance.

### Step 1: Launch an EC2 Instance

1. Go to AWS Console → EC2 → **Launch Instance**
2. Choose **Ubuntu Server 22.04 LTS** (or Amazon Linux 2)
3. Instance type: **t2.micro** (free tier eligible)
4. Configure Security Group to allow:
   - **SSH** (port 22) from your IP
   - **HTTP** (port 80) from anywhere (0.0.0.0/0)
5. Launch and download the **key pair** (.pem file)

### Step 2: SSH into the EC2 Instance

```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

Replace `<EC2_PUBLIC_IP>` with your instance's public IP address.

### Step 3: Install Docker on Ubuntu

```bash
# Update packages
sudo apt update

# Install Docker
sudo apt install docker.io -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (so you can run docker without sudo)
sudo usermod -aG docker ubuntu

# Log out and SSH back in for the group change to take effect
exit
```

SSH back in:

```bash
ssh -i "your-key.pem" ubuntu@<EC2_PUBLIC_IP>
```

Verify Docker is working:

```bash
docker --version
docker run hello-world
```

### Step 4: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/blog-app.git
cd blog-app
```

### Step 5: Start the Application

```bash
docker-compose up --build -d
```

The `-d` flag runs containers in the background (detached mode).

### Step 6: Verify Everything is Running

```bash
# Check running containers
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend
```

### Step 7: Access the Application

Open your browser and go to:

```
http://<EC2_PUBLIC_IP>
```

You should see the blog app homepage.

### Step 8: Test the API

```bash
curl http://<EC2_PUBLIC_IP>/api/health
curl http://<EC2_PUBLIC_IP>/api/blogs
```

### Managing the Application

| Command | Action |
|---------|--------|
| `docker-compose up --build -d` | Start / restart the app |
| `docker-compose down` | Stop the app |
| `docker-compose logs -f` | View live logs |
| `docker-compose ps` | Check running containers |
| `docker-compose restart backend` | Restart only the backend |

### Updating the Application

When new code is pushed to GitHub:

```bash
cd blog-app
git pull origin main
docker-compose up --build -d
```

### Important Notes for EC2

1. **Data persistence:** Blog posts are stored in a Docker volume named
   `backend_data`. If you destroy the volume (`docker-compose down -v`),
   all blog posts will be lost.

2. **Security:** The default security group opens port 80 (HTTP) to the
   world. For production, consider:
   - Adding HTTPS with Let's Encrypt (Certbot) + Nginx
   - Restricting SSH access to specific IPs only
   - Using IAM roles instead of hardcoded credentials

3. **Cost:** A t2.micro instance is free-tier eligible. Stop the instance
   when not in use to avoid charges.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/blogs` | List all blog posts (most recent first) |
| GET | `/api/blogs/:id` | Get a single blog post |
| POST | `/api/blogs` | Create a new blog post |
| PUT | `/api/blogs/:id` | Update an existing blog post |
| DELETE | `/api/blogs/:id` | Delete a blog post |

### Request Body (POST / PUT)

```json
{
  "title": "My Blog Post",
  "author": "John Doe",
  "content": "This is the blog content...",
  "tags": ["javascript", "aws"]
}
```

- `title` (required): Post title
- `author` (optional): Author name, defaults to "Anonymous"
- `content` (required): Post body
- `tags` (optional): Array of tag strings

---

## Architecture

```
Browser
   │  http://<EC2_PUBLIC_IP>
   ▼
Nginx (port 80)
   │  /api/*  ──►  Backend container (port 5000)
   │  /*       ──►  Serves React static files
   ▼
Backend (Express)
   │  reads/writes
   ▼
Docker Volume (backend_data)
   └── blogs.json
```

---

## Troubleshooting

### Port 80 already in use

```bash
# Check what's using port 80
sudo lsof -i :80

# Stop the conflicting service
sudo systemctl stop <service-name>
```

### Permission denied on data folder

```bash
# Inside backend container, ensure data folder is writable
docker-compose exec backend ls -la data/
```

### Can't access from browser

- Check EC2 Security Group: port 80 must be open to 0.0.0.0/0
- Check if containers are running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

---

## Next Steps

- Add **user authentication** (JWT / OAuth)
- Replace JSON file with a real database (**PostgreSQL** or **AWS RDS**)
- Add **HTTPS** with Let's Encrypt
- Set up **CI/CD** with GitHub Actions
- Add **logging** and **monitoring** (CloudWatch)
