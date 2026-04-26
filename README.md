<div align="center">

<img src="https://img.shields.io/badge/Streamify-Video%20Platform-8b5cf6?style=for-the-badge&logo=youtube&logoColor=white" alt="Streamify" />

# Streamify

### Scalable Full-Stack Video Streaming Platform

*Upload · Stream · Engage · Grow*

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<br/>

> A production-grade YouTube-like platform built with clean architecture,  
> JWT authentication, Cloudinary media storage, and a modern dark UI.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Future Enhancements](#future-enhancements)
- [Design Philosophy](#design-philosophy)
- [Author](#author)

---



## Overview

**Streamify** is a full-stack video streaming platform inspired by YouTube, built with a strong focus on **scalability, performance, and clean backend architecture**.

It supports end-to-end video workflows including **upload → Cloudinary processing → secure storage → streaming**, along with real-time engagement features like likes, views, comments, and subscriptions — all backed by a modular REST API and a polished React frontend.

---

## Features

### Video
- Upload videos with thumbnail to Cloudinary
- Stream videos directly in the browser
- Auto view count increment on each watch
- Publish / Unpublish toggle (Public / Private)
- Owner-only Edit and Delete with confirmation modal
- AI-powered title & description generation

### Engagement
- Like / Unlike toggle with live count (optimistic UI)
- Subscribe / Unsubscribe toggle with subscriber count
- Full Comments CRUD — add, edit, delete (owner only)
- Watch history tracked per user

### Auth & Users
- JWT-based authentication with HTTP-only cookies
- Register with avatar + cover image upload
- Login / Logout with token refresh
- Update profile (name, email, avatar, cover image)
- Change password securely
- Public channel page per user (`/channel/:username`)

### Dashboard
- Total videos, views, likes, subscribers at a glance
- Per-video management: edit, delete, publish toggle inline

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client (React + Vite)              │
│         Tailwind CSS · React Router · Axios          │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────┐
│              API Layer (Express.js)                  │
│     Routes → Middleware → Controllers → Models       │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│  MongoDB    │          │   Cloudinary    │
│  (Mongoose) │          │  (Media Store)  │
└─────────────┘          └─────────────────┘
```

**Request lifecycle:**

```
Request → verifyJWT middleware → Controller → Mongoose query → ApiResponse
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (access + refresh tokens), bcrypt |
| Media | Cloudinary (video + image upload) |
| HTTP Client | Axios (with credentials) |
| Dev Tools | Nodemon, ESLint, Prettier |

---

## Project Structure

```
Streamify/
├── Backend/
│   └── src/
│       ├── controllers/        # Business logic
│       │   ├── user.controller.js
│       │   ├── video.controller.js
│       │   ├── like.controller.js
│       │   ├── comment.controller.js
│       │   ├── subscription.controller.js
│       │   ├── dashboard.controller.js
│       │   └── ai.controller.js
│       ├── models/             # Mongoose schemas
│       │   ├── user.model.js
│       │   ├── video.model.js
│       │   ├── like.model.js
│       │   ├── comment.model.js
│       │   └── subscription.model.js
│       ├── routes/             # Express routers
│       ├── middlewares/        # JWT auth, Multer
│       ├── utils/              # ApiError, ApiResponse, Cloudinary
│       └── app.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── VideoPlayer.jsx
        │   ├── Upload.jsx
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── Channel.jsx
        │   └── Auth.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── VideoCard.jsx
        │   ├── Comments.jsx
        │   ├── Icon.jsx
        │   └── StreamifyLogo.jsx
        └── api/
            └── axios.js
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/streamify.git
cd streamify

# 2. Setup Backend
cd Backend
npm install
cp .env.sample .env
# Fill in your .env values (see below)
npm run dev

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

The backend runs on `http://localhost:8000`  
The frontend runs on `http://localhost:5173`

---

## Environment Variables

Create a `.env` file inside the `Backend/` folder:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/streamify
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register with avatar |
| `POST` | `/api/v1/users/login` | Login, returns JWT cookies |
| `POST` | `/api/v1/users/logout` | Logout, clears cookies |
| `GET` | `/api/v1/users/current-user` | Get logged-in user |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/videos` | Get all videos (paginated) |
| `GET` | `/api/v1/videos/:id` | Get video + increment views |
| `POST` | `/api/v1/videos` | Upload video (multipart) |
| `PATCH` | `/api/v1/videos/:id` | Update title/description/thumbnail |
| `DELETE` | `/api/v1/videos/:id` | Delete video (owner only) |
| `PATCH` | `/api/v1/videos/toggle/publish/:id` | Toggle publish status |

### Engagement
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/likes/toggle/v/:videoId` | Toggle like on video |
| `GET` | `/api/v1/likes/v/:videoId` | Get like count + status |
| `GET` | `/api/v1/comments/:videoId` | Get comments |
| `POST` | `/api/v1/comments/:videoId` | Add comment |
| `PATCH` | `/api/v1/comments/c/:commentId` | Edit comment (owner only) |
| `DELETE` | `/api/v1/comments/c/:commentId` | Delete comment (owner only) |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/subscriptions/c/:channelId` | Toggle subscribe |
| `GET` | `/api/v1/subscriptions/status/:channelId` | Get subscription status |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/stats` | Total videos, views, likes, subscribers |
| `GET` | `/api/v1/dashboard/videos` | Owner's video list |

---

## Future Enhancements

| Feature | Description |
|---------|-------------|
| Redis Caching | Cache video metadata and view counts for faster reads |
| Kafka Queue | Async video processing pipeline after upload |
| Search | Full-text search across videos and channels |
| Recommendations | ML-based video recommendation engine |
| Analytics | Per-video analytics — watch time, drop-off, traffic sources |
| Notifications | Real-time alerts for new uploads from subscribed channels |
| HLS Streaming | Adaptive bitrate streaming for large video files |

---

## Design Philosophy

> *"Build it like it's going to production on day one."*

- **Separation of concerns** — controllers handle logic, models handle data, routes handle routing
- **Consistent API responses** — every endpoint returns `{ statusCode, data, message }` via `ApiResponse`
- **Graceful error handling** — `ApiError` class + `asyncHandler` wrapper eliminates try/catch boilerplate
- **Optimistic UI** — like and subscribe update instantly on the frontend, sync with server truth after
- **Security first** — HTTP-only cookies, bcrypt password hashing, JWT expiry, owner-only mutations

---

## Author

<div align="center">

**Rajanna Adhikary**

Information Science & Engineering · Backend & AI Enthusiast



*If this project helped you or impressed you — drop a star!*

⭐

</div>

