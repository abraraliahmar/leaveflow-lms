# 📅 LeaveFlow — Leave Management System

A full-stack web application for managing employee leave requests with role-based access control for Employees and Employers.

---

## 🔗 Live Demo

> **URL:** `https://your-deployment-url.com`  
> Replace with your actual deployed URL after hosting.

---

## ✨ Features

### Employee
- Register and log in as an Employee
- Apply for leave (type, start/end date, reason)
- View all personal leave applications with status (Pending / Approved / Rejected)
- Withdraw pending leave applications

### Employer
- Register and log in as an Employer
- View all employee leave requests in one dashboard
- Approve or reject requests with an optional note
- Filter requests by status

### Technical Highlights
- **JWT-based authentication** with `Bearer` tokens
- **Role-based access control** (RBAC) — routes and actions restricted by role
- **Input validation** on both client and server (express-validator)
- **MongoDB Atlas** for cloud-hosted database
- **REST API** with proper HTTP status codes and error messages
- **Environment variables** for all sensitive configuration

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Vue 3, Vite, Tailwind CSS, Pinia  |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas (Mongoose ODM)      |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Validation | express-validator                 |

---

## 📁 Project Structure

```
lms/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (employee/employer)
│   │   └── Leave.js         # Leave application schema
│   ├── middleware/
│   │   └── auth.js          # JWT authenticate + authorize middleware
│   ├── routes/
│   │   ├── auth.js          # /api/auth - register, login, me
│   │   └── leaves.js        # /api/leaves - CRUD + review
│   ├── server.js            # Express app entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   ├── Dashboard.vue
│   │   │   ├── ApplyLeave.vue
│   │   │   └── LeaveList.vue
│   │   ├── components/
│   │   │   ├── Navbar.vue
│   │   │   └── StatCard.vue
│   │   ├── store/
│   │   │   └── auth.js      # Pinia auth store
│   │   ├── router/
│   │   │   └── index.js     # Vue Router with guards
│   │   ├── api.js           # Axios instance with interceptors
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier is fine)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/leave-management.git
cd leave-management
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/leave-management?retryWrites=true&w=majority
JWT_SECRET=your_random_secret_string_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev   # development (nodemon)
npm start     # production
```

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment

### Option A: Render (Recommended — Free)

**Backend on Render:**
1. Create a new "Web Service" on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables in Render dashboard

**Frontend on Render:**
1. Create a new "Static Site"
2. Set root directory to `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Set `VITE_API_URL` to your backend URL, e.g. `https://lms-api.onrender.com/api`

### Option B: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login

# Deploy backend
cd backend && railway up

# Deploy frontend (as a static site)
cd ../frontend && npm run build && railway up
```

### Option C: Vercel (Frontend) + Railway/Render (Backend)

1. Deploy frontend on [vercel.com](https://vercel.com) — set `VITE_API_URL` in project settings
2. Deploy backend on Railway or Render

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint             | Auth | Description            |
|--------|----------------------|------|------------------------|
| POST   | /api/auth/register   | ❌   | Register new user      |
| POST   | /api/auth/login      | ❌   | Login and get JWT      |
| GET    | /api/auth/me         | ✅   | Get current user info  |

### Leaves
| Method | Endpoint                    | Role      | Description                |
|--------|-----------------------------|-----------|----------------------------|
| POST   | /api/leaves                 | Employee  | Submit leave application   |
| GET    | /api/leaves                 | Both      | List leaves (filtered)     |
| GET    | /api/leaves/:id             | Both      | Get single leave           |
| PATCH  | /api/leaves/:id/review      | Employer  | Approve or reject leave    |
| DELETE | /api/leaves/:id             | Employee  | Withdraw pending leave     |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens expire in 7 days
- Sensitive config values in **environment variables only** (never hardcoded)
- Role validation on every protected route
- Employees can only access/delete their own leaves

---

## 📋 Leave Types Supported

`sick` · `casual` · `annual` · `maternity` · `paternity` · `unpaid`

---

## 📝 Notes

- The first user to register as an "employer" will be able to review all employee requests.
- Approved or rejected leaves cannot be re-reviewed (immutable status).
- Employees cannot withdraw approved/rejected applications.
