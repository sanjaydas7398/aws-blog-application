# S3 Image Upload Setup Guide
## Reusable Documentation for Any Project

---

## Table of Contents
1. [AWS S3 Bucket Setup](#1-aws-s3-bucket-setup)
2. [IAM Permissions](#2-iam-permissions)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Nginx Configuration](#5-nginx-configuration)
6. [CI/CD Secrets](#6-cicd-secrets)
7. [Troubleshooting](#7-troubleshooting)
8. [Quick Checklist](#8-quick-checklist)

---

## 1. AWS S3 Bucket Setup

### 1.1 Create Bucket
1. AWS Console → **S3 → Create bucket**
2. Bucket name: `your-project-images-<account-id>` (must be globally unique)
3. Region: `ap-south-1` (or your preferred region)
4. **Uncheck** "Block all public access"
5. Check "I acknowledge that..."
6. Click **Create bucket**

### 1.2 Enable CORS
1. Go to bucket → **Permissions** tab
2. Scroll to **CORS configuration** → Click **Edit**
3. Paste the following JSON:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"]
  }
]
```
4. Click **Save changes**

### 1.3 Bucket Policy (Public Read Access)
1. In same **Permissions** tab, scroll to **Bucket policy** → Click **Edit**
2. Paste the following JSON:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```
3. **Replace** `YOUR-BUCKET-NAME` with your actual bucket name
4. Click **Save changes**

> **Note:** If you get an error saving the policy, go to **Block Public Access** → **Edit** → Uncheck "Block all public access" → Save → Then retry bucket policy.

---

## 2. IAM Permissions

### Option A: IAM User (for local development / GitHub Actions)

1. AWS Console → **IAM → Users → Your user → Security credentials**
2. Create access key if you don't have one:
   - Click **Create access key**
   - Choose **Local code**
   - Click **Create access key**
   - **Copy** the Access Key ID and Secret Access Key (you can only see the secret once!)
3. Go to **Permissions** tab → **Add permissions** → **Attach policies directly**
4. Click **Create policy** → **JSON** tab → Paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```
5. Replace `YOUR-BUCKET-NAME` with your bucket name
6. Name the policy: `ProjectS3Access`
7. Click **Create policy**
8. Attach `ProjectS3Access` policy to your user

### Option B: IAM Role (for EC2/ECS/Lambda)

1. AWS Console → **IAM → Roles → Your role → Permissions**
2. Click **Add permissions** → **Attach policies directly**
3. Search for `ProjectS3Access` → Check it
4. Click **Add permissions**

> **Note:** For EC2, ensure your instance has this role attached in **EC2 → Instances → Actions → Security → Modify IAM role**

---

## 3. Backend Implementation

### 3.1 Install Dependencies
```bash
cd backend
npm install multer @aws-sdk/client-s3
```

### 3.2 Create `backend/s3.js`
```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadImageToS3(fileBuffer, originalName, mimetype) {
  if (!BUCKET_NAME) {
    console.log("S3 skipped: S3_BUCKET_NAME is not set");
    return null;
  }

  const ext = originalName.split(".").pop() || "bin";
  const key = `blog-images/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  try {
    await s3.send(command);
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;
    console.log("S3 upload success:", url);
    return url;
  } catch (err) {
    console.error("S3 upload failed:", err);
    return null;
  }
}

module.exports = { uploadImageToS3 };
```

### 3.3 Update `backend/routes/blogs.js`

Add these imports at the top:
```javascript
const multer = require("multer");
const { uploadImageToS3 } = require("../s3");
```

Add multer configuration:
```javascript
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported image type"));
    }
  },
});
```

Update POST route:
```javascript
// POST /api/blogs - create a new blog
router.post("/", upload.single("image"), async (req, res) => {
  const { title, author, content, tags } = req.body;

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  let imageUrl = null;
  if (req.file) {
    try {
      imageUrl = await uploadImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch (err) {
      console.error("S3 upload failed:", err);
      imageUrl = null;
    }
  }

  const blogs = readBlogs();
  const now = new Date().toISOString();

  const newBlog = {
    id: uuidv4(),
    title: title.trim(),
    author: author && author.trim() ? author.trim() : "Anonymous",
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : [],
    imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  blogs.push(newBlog);
  writeBlogs(blogs);

  res.status(201).json(newBlog);
});
```

Update PUT route:
```javascript
// PUT /api/blogs/:id - update existing blog
router.put("/:id", upload.single("image"), async (req, res) => {
  const { title, author, content, tags } = req.body;
  const blogs = readBlogs();
  const index = blogs.findIndex((b) => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Blog not found" });
  }

  if (!title || !title.trim() || !content || !content.trim()) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  const existing = blogs[index];
  let imageUrl = existing.imageUrl;

  if (req.file) {
    try {
      imageUrl = await uploadImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    } catch (err) {
      console.error("S3 upload failed:", err);
      imageUrl = null;
    }
  }

  const updated = {
    ...existing,
    title: title.trim(),
    author: author && author.trim() ? author.trim() : existing.author,
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : existing.tags,
    imageUrl,
    updatedAt: new Date().toISOString(),
  };

  blogs[index] = updated;
  writeBlogs(blogs);

  res.json(updated);
});
```

### 3.4 Update `backend/package.json`
Add to dependencies:
```json
{
  "multer": "^2.2.0",
  "@aws-sdk/client-s3": "^3.600.0"
}
```

### 3.5 Environment Variables
Create `.env` file in backend folder (for local development):
```env
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

For production (Docker/EC2), pass these as environment variables in your deployment config.

---

## 4. Frontend Implementation

### 4.1 Update `frontend/src/components/BlogForm.jsx`

Add state for image:
```jsx
const [imageFile, setImageFile] = useState(null);
const [imagePreview, setImagePreview] = useState(initialValues?.imageUrl || "");
```

Add image change handler:
```jsx
function handleImageChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
}
```

Update submit handler:
```jsx
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
    await onSubmit({ title, author, content, tags, imageFile });
  } catch (err) {
    setError(err.message);
    setSubmitting(false);
  }
}
```

Add image upload field in form JSX:
```jsx
<div className="form-group">
  <label className="form-label">Image</label>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={handleImageChange}
  />
  {imagePreview && (
    <img
      src={imagePreview}
      alt="Preview"
      style={{ marginTop: 10, maxWidth: "100%", maxHeight: 200 }}
    />
  )}
</div>
```

### 4.2 Update `frontend/src/api.js`

Replace createBlog and updateBlog:
```javascript
function buildFormData(payload) {
  const form = new FormData();
  if (payload.title) form.append("title", payload.title);
  if (payload.author) form.append("author", payload.author);
  if (payload.content) form.append("content", payload.content);
  if (payload.tags) form.append("tags", JSON.stringify(payload.tags));
  if (payload.imageFile) form.append("image", payload.imageFile);
  return form;
}

export async function createBlog(payload) {
  const form = buildFormData(payload);
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: form,
  });
  return handleResponse(res);
}

export async function updateBlog(id, payload) {
  const form = buildFormData(payload);
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: form,
  });
  return handleResponse(res);
}
```

### 4.3 Display Images in BlogList and BlogDetail

Add this where you want the image to appear:
```jsx
{blog.imageUrl && (
  <img
    src={blog.imageUrl}
    alt={blog.title}
    style={{ maxWidth: "100%", maxHeight: 180, marginTop: 8, borderRadius: 6 }}
  />
)}
```

---

## 5. Nginx Configuration

### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;
    client_max_body_size 10M;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://blog-backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

> **Important:** Change `proxy_pass http://backend:5000/api/;` to `proxy_pass http://blog-backend:5000/api/;` to match your Docker container name.

---

## 6. CI/CD Secrets

Add these GitHub Secrets (Settings → Secrets and variables → Actions):

| Secret | Value | Description |
|--------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM access key | For GitHub Actions to authenticate with AWS |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key | For GitHub Actions to authenticate with AWS |
| `EC2_HOST` | EC2 public IP | Your EC2 instance public IP |
| `EC2_USERNAME` | `ubuntu` | EC2 SSH username |
| `EC2_SSH_KEY` | Content of `.pem` file | Private key for SSH access |
| `S3_BUCKET_NAME` | Your bucket name | S3 bucket for image uploads |

---

## 7. Troubleshooting

| Error | Cause | Fix |
|------|-------|-----|
| `S3_BUCKET_NAME is not set` | Environment variable missing | Add `S3_BUCKET_NAME` to container env or `.env` file |
| `AccessDenied` | IAM policy not attached or wrong | Attach `ProjectS3Access` policy to user/role |
| `AccessControlListNotSupported` | Bucket has ACLs disabled + code sets ACL | Remove `ACL: "public-read"` from `s3.js` |
| `403 Forbidden` | Bucket policy missing or public access blocked | Add bucket policy + disable Block Public Access |
| `413 Request Entity Too Large` | Nginx default 1MB limit | Add `client_max_body_size 10M` to `nginx.conf` |
| `502 Bad Gateway` | Backend not running or wrong network | Start backend container + ensure both on same Docker network |
| `Resolved credential object is not valid` | Invalid/expired AWS credentials | Generate new access key in IAM console |
| `NoSuchBucket` | Bucket doesn't exist or wrong region | Create bucket or check region in code matches bucket region |

---

## 8. Quick Checklist for New Project

- [ ] **S3 Bucket**
  - [ ] Create bucket with unique name
  - [ ] Uncheck "Block all public access"
  - [ ] Enable CORS
  - [ ] Add bucket policy for public read

- [ ] **IAM**
  - [ ] Create `ProjectS3Access` policy
  - [ ] Attach to IAM user (local/GitHub) or role (EC2/ECS)

- [ ] **Backend**
  - [ ] Install `multer` and `@aws-sdk/client-s3`
  - [ ] Create `s3.js` utility
  - [ ] Update routes with multer + S3 upload
  - [ ] Add `imageUrl` field to blog schema
  - [ ] Set environment variables

- [ ] **Frontend**
  - [ ] Add image upload input in form
  - [ ] Change API calls to use `FormData`
  - [ ] Display images in list/detail views

- [ ] **Infrastructure**
  - [ ] Update `nginx.conf` (proxy + upload limit)
  - [ ] Create Docker network for containers
  - [ ] Add GitHub Secrets for CI/CD
  - [ ] Test upload and verify S3 URL

---

## Important Notes

1. **Never commit AWS credentials** to git. Use environment variables or secrets.
2. **Bucket names are globally unique** across ALL AWS accounts. If `my-blog-images` is taken, use `my-blog-images-123456789`.
3. **ACLs are deprecated** in newer S3 buckets. Don't use `ACL: "public-read"`. Use bucket policies instead.
4. **Multer stores files in memory** by default. For very large files, use disk storage.
5. **Always test locally first** with `.env` file before deploying to production.

---

## Contact / Reference

- AWS S3 Docs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/
- AWS SDK v3 Docs: https://docs.aws.amazon.com/sdk-for-javascript/
- Multer Docs: https://github.com/expressjs/multer

---

**Last Updated:** 2026-08-15
**Project:** Blog Application with S3 Image Uploads
