# DevBlog: Developer Blogging Platform

DevBlog is a full-stack, feature-rich developer blogging platform. It is built using the **MERN Stack** (MongoDB, Express, React, Node.js) and features a modern, clean developer-focused UI, JWT authentication, nested comments, live markdown previews, real-time activity notifications, bookmark lists, and built-in AI post summary generation and toxic comment moderation checks.

---

## 🚀 Key Features

1. **Authentication & Authorization**: Full sign-up/login with hashed password storage, JWT tokens, persistent session cookies, protected page redirects, and role-based guards (Regular Users vs Admins).
2. **User Profiles**: Custom bio statements, location tags, social links, follow/unfollow capabilities, follower stats count, and profile setting updates.
3. **Rich Article Editor**: Create and edit posts using markdown syntax. Toggle **Live Preview** side-by-side to review typography, inline elements, and code formatting before publishing.
4. **Interactive Discussion Feed**: Paginated feed with tab filtering (Latest vs Trending based on view counts & likes) and instant tag filtering.
5. **Nested Comments System**: Post, reply, or like comments with clear visual indentations. Supports soft deletion for comments with active replies.
6. **Advanced AI Features**:
   - **AI-Generated Article Summaries**: Get automatic summaries of posts.
   - **AI Toxic Comment Moderation**: Instant keyword safety scanning flags abusive language to keep discussions clean and welcoming.
7. **Reaction System**: Interactive heart reactions and an offline/online reading list (bookmark posts).
8. **Admin Panel**: Dashboard displaying total users, articles count, global interactions, and controls to delete users or delete posts.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite Scaffold)
- **Tailwind CSS v4** (Utility-first styling with Vite compiler plugin)
- **React Router DOM** (Multi-page routing structure)
- **Axios** (Interceptors for authorization headers)
- **Lucide React** (Modern developer icon sets)
- **React Markdown** & **Remark GFM** (Markdown compilation)

### Backend
- **Node.js** & **Express.js** (REST API)
- **MongoDB** & **Mongoose** (Data schemas & Indexes)
- **JWT** & **bcryptjs** (Auth security & password hashing)
- **Express Rate Limit** & **Helmet** (CORS protection, security headers, rate limiting)

---

## 📁 Directory Structure

```text
devblog-platform/
 ├── client/                  # Frontend React client
 │    ├── src/
 │    │    ├── components/    # Reusable UI components (ArticleCard, CommentSection, etc.)
 │    │    ├── context/       # Auth state context
 │    │    ├── layouts/       # Sticky navbars, sidebars, drawered menus
 │    │    ├── pages/         # Page containers (HomeFeed, ArticleDetails, Admin, etc.)
 │    │    ├── services/      # Axios api requests client
 │    │    ├── index.css      # Custom Tailwind v4 styling and markdown typography
 │    │    └── App.jsx        # Routing configuration
 └── server/                  # Backend Express REST API
      ├── config/             # Database connection setups
      ├── controllers/        # Express handlers (Auth, Posts, Comments, etc.)
      ├── middleware/         # Security guards & Error handles
      ├── models/             # Mongoose schemas (User, Post, Comment, Notification)
      ├── routes/             # REST route bindings
      ├── utils/              # Token generation utils
      ├── .env                # Local environment secrets
      ├── seed.js             # Pre-population database scripts
      └── server.js           # Server application entry point
```

---

## ⚙️ Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on port `27017`

### 1. Database Seeding & Backend setup
Open a terminal in the `server` directory:

```bash
cd server
npm install
node seed.js
```
This will pre-populate the database with 3 complete developer profiles, articles, nested discussions, and reactions.

To start the backend server:
```bash
npm run start # runs server.js
```

### 2. Frontend client setup
Open another terminal in the `client` directory:

```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to explore different features:

| Username | Password | Role | Description |
|---|---|---|---|
| `linus_torvalds` | `password123` | **Admin** | Access to the Admin Dashboard to moderate users & posts |
| `ada_lovelace` | `password123` | **User** | Standard programmer user profile |
| `dan_abramov` | `password123` | **User** | Standard programmer user profile |

---

## 🔒 Security Implementations
- **Hashed Credentials**: Passwords stored using 12-round bcrypt salt factor.
- **JWT Protection**: Route guards protect access to settings, bookmarks, and article creation.
- **Limiter Middleware**: Prevents brute-force requests.
- **Helmet Headers**: Secure headers enabled automatically on the Express app.
