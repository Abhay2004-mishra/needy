# JobConnect - Job Requirement & Booking Platform

A production-ready full-stack web application for job posting, discovery, and booking.

## Tech Stack

### Backend (`/server`)
- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database & ODM
- **JWT** - Authentication with bcrypt password hashing
- **Helmet** + **CORS** + **Rate Limiting** - Security middleware
- **Express Validator** - Input validation
- **Morgan** - HTTP request logging

### Frontend (`/client`)
- **React 18** + **Vite** - UI framework & build tool
- **React Router v6** - Client-side routing
- **TailwindCSS v3** - Utility-first CSS
- **Axios** - HTTP client
- **Context API** - State management

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (port 27017) or a MongoDB Atlas URI

## Quick Start

### 1. Install all dependencies
```bash
npm run install-all
```

### 2. Configure environment
Edit `server/.env` with your MongoDB URI if needed:
```
MONGODB_URI=mongodb://localhost:27017/jobconnect
JWT_SECRET=your_secret_key
```

### 3. Seed the database (optional)
```bash
npm run seed
```
Test credentials: `john@example.com` / `password123`

### 4. Run both servers
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Project Structure

```
├── package.json          # Root scripts (concurrently)
├── server/               # Express.js Backend
│   ├── config/db.js      # MongoDB connection
│   ├── models/           # Mongoose schemas (User, Job, Booking)
│   ├── routes/           # API routes (auth, jobs, bookings, users)
│   ├── middleware/auth.js # JWT verification
│   ├── seed/seedData.js  # Sample data seeder
│   └── server.js         # Entry point
├── client/               # React Frontend
│   ├── src/
│   │   ├── components/   # Navbar, Footer, Modal, JobCard
│   │   ├── context/      # AuthContext, ToastContext
│   │   ├── pages/        # Home, Jobs, PostJob, Dashboard
│   │   ├── services/api.js # Axios API layer
│   │   └── utils/        # Constants & helpers
│   ├── tailwind.config.js
│   └── vite.config.js
└── index.html            # Original monolithic file (legacy)
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| POST | `/api/auth/register` | ✗ | Register user |
| POST | `/api/auth/login` | ✗ | Login user |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/jobs` | ✗ | List jobs (filterable) |
| GET | `/api/jobs/:id` | ✗ | Get single job |
| POST | `/api/jobs` | ✓ | Create job |
| PUT | `/api/jobs/:id` | ✓ | Update job (owner) |
| DELETE | `/api/jobs/:id` | ✓ | Delete job (owner) |
| POST | `/api/bookings` | ✓ | Book a job |
| GET | `/api/bookings/my` | ✓ | Get my bookings |
| DELETE | `/api/bookings/:jobId` | ✓ | Cancel booking |
| PUT | `/api/users/profile` | ✓ | Update profile |
| GET | `/api/users/stats` | ✓ | Dashboard stats |
