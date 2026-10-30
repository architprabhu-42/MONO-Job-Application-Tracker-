# MONO — Job Application Tracker & Resume Manager

> **Your career, organized.**

MONO is a full-stack MERN web application for students and job seekers to track job applications, manage different resume versions, schedule interviews and follow up on time — all in a clean, monochrome interface.

---

## 1. Abstract

Job seekers often apply to dozens of companies with several tailored versions of their resume. Applications get scattered across emails, spreadsheets and notes, and it becomes hard to remember which resume went to which company, when to follow up, or when the next interview is. **MONO** solves this with a single dashboard where a user can record each application, attach the exact resume (PDF) version used, schedule interviews, and see live statistics about their job search. It is built with MongoDB, Express.js, React and Node.js (MERN), with secure login so every user sees only their own data.

## 2. Problem statement

- Application details (company, role, status, recruiter, links) are spread across many places.
- People lose track of **which resume version** was sent to which company.
- Interview dates and follow-ups are easy to miss.
- There is no quick overview of how the job search is going (how many in progress, interviews, offers).

## 3. Objectives

1. Provide CRUD (create, read, update, delete) for job applications, resumes and interviews.
2. Store resume PDFs securely and link a resume version to each application.
3. Show a dashboard with statistics calculated from real database records.
4. Validate every form on both the frontend (React Hook Form + Zod) and the backend (Zod).
5. Protect user data with password hashing and HTTP-only cookie authentication.
6. Deliver a responsive, consistent, professional black-and-white UI.

## 4. Technologies used

| Layer | Technology |
| --- | --- |
| Frontend | React 19 (Vite), JavaScript/JSX, React Router DOM, Bootstrap 5 (grid & utilities), custom CSS design system, Lucide React icons, Axios, React Hook Form, Zod + `@hookform/resolvers` |
| Backend | Node.js, Express 5, Mongoose, Multer (uploads), Zod (server validation), bcryptjs (password hashing), jsonwebtoken (signed session token), cookie-parser, CORS, dotenv |
| Database | MongoDB (local for development, MongoDB Atlas for production), GridFS (optional PDF storage) |
| Font | Poppins (Google Fonts) |

## 5. Features

**Authentication**
- Register / log in / log out with email and password.
- Passwords hashed with bcrypt; session kept in an **HTTP-only cookie** (nothing sensitive in localStorage).
- Every API route except register/login/health requires login, and every query is scoped to the logged-in user.

**Dashboard**
- Total applications, in progress, interviews scheduled, offers received — all from MongoDB.
- Recent applications (company, position, date, status, resume used).
- Upcoming interviews in date order.
- Application status overview (monochrome CSS bar chart).
- Quick actions, and a follow-up reminder list (overdue or due within 7 days).
- Friendly empty state for new users.

**Applications**
- List with search (company or job title), filter by status and job type, sort by date / company / status — instant, no page reload.
- Table on desktop, stacked cards on mobile, "days since applied" indicator.
- Add / edit in a validated modal form, delete with confirmation (also deletes its interviews).
- Export to CSV.
- Details page: all fields, job link, recruiter, linked resume (open/download PDF), notes, follow-up date, quick status change, and its interviews (add/edit/delete).

**Resumes**
- Upload PDF versions (name, version label, description, skills targeted, date created).
- Preview in a new tab or download; edit metadata or replace the PDF; delete with confirmation.
- Shows how many applications use each resume. Deleting a resume safely **unlinks** it from those applications (no broken references).

**Interviews**
- Upcoming / Completed / All views, search by company or position.
- Schedule, edit, delete; each interview is linked to one of your applications.
- Scheduling an interview moves an early-stage application (Wishlist/Applied/Under Review) to "Interview" automatically.

**Settings**
- Edit display name and email, account info, dashboard overview counts, about section, log out.

## 6. MERN architecture

```
 ┌──────────────────────────┐   HTTP (JSON / multipart)    ┌─────────────────────────────┐
 │  React (Vite) frontend   │  ─────────────────────────▶  │  Express REST API (Node.js) │
 │  pages, forms, Axios     │  ◀─────────────────────────  │  routes → middleware →      │
 │  React Hook Form + Zod   │   JSON + HTTP-only cookie    │  controllers → models       │
 └──────────────────────────┘                              └──────────────┬──────────────┘
                                                                          │ Mongoose
                                                           ┌──────────────▼──────────────┐
                                                           │  MongoDB (local / Atlas)    │
                                                           │  users, applications,       │
                                                           │  resumes, interviews        │
                                                           │  (+ resume PDFs in GridFS   │
                                                           │   or server/uploads)        │
                                                           └─────────────────────────────┘
```

Request flow example — *adding an application*:
`ApplicationForm` (validates with Zod) → `POST /api/applications` via Axios → `requireAuth` middleware checks the cookie → `validate(applicationSchema)` re-validates on the server → controller checks the chosen resume belongs to the user → `Application.create()` saves to MongoDB → JSON response → the list and dashboard reload without a page refresh.

### Folder structure

```
WPMiniProject/
├── client/                     React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         Sidebar, Navbar (mobile), PageHeader, AppLayout, AuthLayout, ErrorBoundary
│   │   │   ├── ui/             Button, Input, Select, Modal, ConfirmDialog, StatusBadge, EmptyState,
│   │   │   │                   LoadingState, ErrorState, StatCard, Panel
│   │   │   ├── applications/   ApplicationForm, ApplicationTable, ApplicationFilters
│   │   │   ├── resumes/        ResumeForm, ResumeList
│   │   │   └── interviews/     InterviewForm, InterviewList
│   │   ├── pages/              Dashboard, Applications, ApplicationDetails, Resumes, Interviews,
│   │   │                       Settings, Login, Register, NotFound
│   │   ├── context/            AuthContext (logged-in user), ToastContext (notifications)
│   │   ├── hooks/              useAsync (data loading), useDebounce (search)
│   │   ├── services/api.js     All Axios API calls
│   │   ├── utils/              constants, Zod schemas, date formatting, CSV export
│   │   ├── App.jsx, main.jsx, index.css (design system)
│   └── .env.example
├── api/index.js                Vercel serverless entry point (wraps server/app.js)
├── server/                     Express backend
│   ├── app.js                  Express app: middleware + routes (no listen)
│   ├── server.js               Starts the app as a normal Node server (local / Render)
│   ├── config/                 env.js (loads .env), db.js (MongoDB connection)
│   ├── models/                 User, Application, Resume, Interview
│   ├── validators/schemas.js   Server-side Zod schemas
│   ├── middleware/             auth, validate, upload (Multer), errorHandler
│   ├── controllers/            auth, application, resume, interview, dashboard
│   ├── routes/                 one router per resource
│   ├── services/storage.js     Resume file storage (local disk or GridFS)
│   ├── scripts/seed.js         Demo data
│   ├── uploads/                Local PDF storage (git-ignored)
│   └── .env.example
├── vercel.json                 Vercel build settings and rewrites
├── render.yaml                 Render deployment blueprint
└── package.json                Root scripts (run both apps together)
```

## 7. Database collections and relationships

```
 User 1 ──── * Application * ──── 0..1 Resume
                   │
                   1
                   │
                   * Interview
 (every Application, Resume and Interview also stores userId → User)
```

| Collection | Fields | Notes |
| --- | --- | --- |
| **users** | name, email, passwordHash, createdAt, updatedAt | `email` is unique; only the bcrypt hash is stored |
| **applications** | userId, company, position, jobType, location, workArrangement, dateApplied, status, jobUrl, salaryRange, resumeId, recruiterName, recruiterEmail, jobDescription, notes, followUpDate, timestamps | `resumeId` → resumes (optional). Indexes: `{userId, dateApplied}`, `{userId, status}`, `{userId, resumeId}` |
| **resumes** | userId, name, version, description, skillsTargeted[], dateCreated, fileStorageKey, storageDriver, originalFilename, mimeType, fileSize, timestamps | Only metadata. The PDF is stored on disk or in GridFS under a random UUID file name |
| **interviews** | userId, applicationId, date, time, type, interviewerName, meetingLink, preparationNotes, result, timestamps | `applicationId` → applications (required). Index: `{userId, date}` |

**Relationship rules**
- One resume can be linked to many applications.
- Deleting a **resume** sets `resumeId = null` on the applications that used it, then deletes the PDF.
- Deleting an **application** also deletes its interviews.
- A user can only link their own resumes / applications (checked on the server).

**Enums**
- Status: Wishlist, Applied, Under Review, Interview, Offer, Rejected, Withdrawn
- Job type: Internship, Full-time, Part-time, Contract, Freelance
- Work arrangement: On-site, Hybrid, Remote
- Interview type: HR, Technical, Behavioral, Phone, Video, On-site
- Interview result: Pending, Passed, Failed, Rescheduled

## 8. Forms and validation

All forms use **React Hook Form + Zod** in the browser (`client/src/utils/validation.js`) and are validated **again on the server** with Zod (`server/validators/schemas.js`). Server field errors are shown next to the matching input. Submit buttons show a spinner and are disabled while submitting (prevents duplicate submissions); success and error toasts appear after every submit.

| # | Form | Fields | Validation rules |
| --- | --- | --- | --- |
| 1 | **Registration** (`Register.jsx`) | Name, Email, Password, Confirm password | Name required (2–60 chars); valid email; password ≥ 8 chars; confirm must match; server rejects duplicate emails (409) |
| 2 | **Job application** (`ApplicationForm.jsx`) | Company*, Job title*, Job type*, Status*, Date applied*, Work arrangement, Location, Salary, Job URL, Resume, Recruiter name/email, Job description, Notes, Follow-up date | Required fields; job type/status/work arrangement must be valid enum values; valid dates; URL must be `http(s)://…` if given; recruiter email format if given; length limits; server checks the resume belongs to the user |
| 3 | **Resume upload** (`ResumeForm.jsx`) | Resume name*, Version label*, PDF file*, Description, Skills targeted, Date created | Name & version required; file required when creating; **PDF only** (type + extension), **max 4 MB** (Vercel caps request bodies at 4.5 MB); server re-checks type, size (Multer limit) and the real file signature (`%PDF-`) |
| 4 | **Interview** (`InterviewForm.jsx`) | Related application*, Date*, Time, Type*, Interviewer, Meeting link/location, Preparation notes, Result | Application required and must belong to the user; valid date; time `HH:mm`; type/result valid enums |
| + | Login, Profile (Settings) | Email/password; name/email | Required + email format |

Invalid fields get a dark, thicker border, a light gray fill and an inline message with an icon.

## 9. REST API

Base URL: `/api`. Responses are JSON: `{ success, message?, data?, errors? }`. All routes except auth register/login/logout and health require the auth cookie.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check (also reports DB connection) |
| POST | `/api/auth/register` | Create account, sets cookie |
| POST | `/api/auth/login` | Log in, sets cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/me` | Update name / email |
| GET | `/api/applications?search=&status=&jobType=&sort=newest\|oldest\|company\|status` | List (filtered, sorted) |
| POST | `/api/applications` | Create |
| GET | `/api/applications/:id` | One application + its interviews |
| PUT | `/api/applications/:id` | Update |
| PATCH | `/api/applications/:id/status` | Quick status change |
| DELETE | `/api/applications/:id` | Delete (and its interviews) |
| GET | `/api/resumes` | List (with usage count) |
| POST | `/api/resumes` | Upload (multipart: `file` + fields) |
| GET | `/api/resumes/:id` | One resume + applications using it |
| PUT | `/api/resumes/:id` | Update metadata, optional new `file` |
| DELETE | `/api/resumes/:id` | Delete (unlinks applications) |
| GET | `/api/resumes/:id/download[?download=1]` | Stream the PDF (owner only; inline or attachment) |
| GET | `/api/interviews?view=upcoming\|completed\|all&search=` | List |
| POST | `/api/interviews` | Create |
| GET | `/api/interviews/:id` | One interview |
| PUT | `/api/interviews/:id` | Update |
| DELETE | `/api/interviews/:id` | Delete |
| GET | `/api/dashboard/stats` | Counts, status breakdown, recent apps, upcoming interviews, follow-ups |

Status codes used: `200`, `201` created, `400` validation / invalid id, `401` not logged in, `404` not found (also used when a record belongs to another user), `409` duplicate email, `500` server error. A central error handler (`middleware/errorHandler.js`) formats every error.

## 10. Installation and running locally

### Prerequisites
- **Node.js 20.19+** (tested with Node 24) and npm
- **MongoDB** — either installed locally (Community Server, running on `mongodb://127.0.0.1:27017`) or a free **MongoDB Atlas** cluster

### Steps

```bash
npm run install:all
```

Create the backend environment file (then edit it — at minimum set `SESSION_SECRET`):

```bash
cp server/.env.example server/.env
```

Generate a strong secret for `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

(Optional) load demo data — creates the account `demo@mono.test` / `demo12345` with sample resumes, applications and interviews:

```bash
npm run seed
```

Start the backend (port 5000) and frontend (port 5173) together:

```bash
npm run dev
```

Open **http://localhost:5173**. Or run them separately in two terminals with `npm run dev:server` and `npm run dev:client`.

In development the Vite dev server proxies `/api` to `http://localhost:5000`, so the browser sees one origin and the login cookie works without extra CORS setup.

### Using MongoDB Atlas instead of local MongoDB
1. Create a free cluster at https://www.mongodb.com/atlas, add a database user, and allow your IP (or `0.0.0.0/0` for hosted servers) under *Network Access*.
2. Copy the connection string and put it in `server/.env`:
   `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mono?retryWrites=true&w=majority`

### Production build check

```bash
npm run build
```

## 11. Environment variables

**server/.env**

| Variable | Example | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/mono` | MongoDB / Atlas connection string (**required**) |
| `PORT` | `5000` | API port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `NODE_ENV` | `development` / `production` | Production enables secure cookies and serving `client/dist` |
| `SESSION_SECRET` | long random string | Signs the login token (**required**, keep private) |
| `STORAGE_DRIVER` | `local` or `gridfs` | Where resume PDFs are stored |
| `UPLOAD_DIR` | `uploads` | Folder (inside `server/`) for the `local` driver |
| `COOKIE_SAMESITE` | `lax` or `none` | `lax` when frontend and API share an origin; `none` if the browser calls the API on another domain |

**client/.env** (optional)

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | API base URL. Keep `/api` for same-origin setups; use a full URL (e.g. `https://mono-api.onrender.com/api`) only for a direct cross-domain API |

`.env` files and uploaded PDFs are excluded from Git by `.gitignore`. Never commit real secrets.

### Resume storage
- **`local`** (default for development): PDFs are saved in `server/uploads/` with random UUID names. ⚠️ Many hosts (e.g. Render free tier, Heroku) have an **ephemeral filesystem** — files saved there disappear on redeploy/restart.
- **`gridfs`** (recommended for deployment): PDFs are stored inside MongoDB (Atlas) using GridFS, so they persist wherever the database lives. Atlas's free tier has 512 MB storage, enough for many resumes.

## 12. Deployment

### Option A — Vercel (frontend + API in one project, recommended)

On Vercel the React build is served from Vercel's CDN, and the Express app runs as a **serverless function** (`api/index.js`) that handles every `/api/*` request. Both live on the same domain, so the login cookie works without any CORS setup.

```
 Browser ──▶ https://<project>.vercel.app
               ├── /assets, /, /applications …  → client/dist (static, SPA fallback to index.html)
               └── /api/*                       → api/index.js → server/app.js (Express) → MongoDB Atlas
```

Files involved: `vercel.json` (build settings and rewrites), `api/index.js` (serverless entry point that reuses the MongoDB connection), `server/app.js` (the Express app shared with `server/server.js`).

**1. Create the database (MongoDB Atlas, free)**
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. *Database Access* → add a database user with a password.
3. *Network Access* → **Allow access from anywhere** (`0.0.0.0/0`). Vercel's servers have no fixed IP addresses, so this is required.
4. *Connect → Drivers* → copy the connection string and add a database name, e.g.
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mono?retryWrites=true&w=majority`

**2. Import the project on Vercel**
1. Sign in at https://vercel.com with GitHub and choose **Add New → Project**, then import this repository.
2. Keep **Root Directory** as the repository root (`./`). Framework preset: **Other**. The build, install and output settings are read from `vercel.json` — leave them unchanged.
3. Add these **Environment Variables**:

| Name | Value |
| --- | --- |
| `MONGODB_URI` | your Atlas connection string |
| `SESSION_SECRET` | a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `STORAGE_DRIVER` | `gridfs` |
| `CLIENT_URL` | `https://<project>.vercel.app` (your production URL) |

4. Click **Deploy**. When it finishes, open `https://<project>.vercel.app/api/health` — it should return `"status":"ok","database":"connected"` — then open the site, register and use it.

**3. (Optional) demo data on the live database** — temporarily set `MONGODB_URI` in `server/.env` to the Atlas string and run `npm run seed` (creates `demo@mono.test` / `demo12345`), then switch it back.

**Vercel limits to know**
- Request bodies are capped at **4.5 MB**, so resume uploads are limited to **4 MB**.
- Functions have no persistent disk: resume PDFs are always stored in MongoDB **GridFS** on Vercel (forced automatically when the `VERCEL` environment variable is present).
- The first request after a period of inactivity may take a second or two while the function starts and connects to MongoDB.
- Every push to the `main` branch on GitHub triggers a new production deployment automatically.

### Option B — single Render web service
Express serves both the API and the built React app from one long-running server.

1. Create a MongoDB Atlas cluster as above.
2. On https://render.com → **New → Blueprint**, pick the repository (it reads `render.yaml`), **or** create a **Web Service** manually with build command `npm run build`, start command `npm start` and health check path `/api/health`.
3. Set environment variables: `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`, `STORAGE_DRIVER=gridfs`, `COOKIE_SAMESITE=lax`, `CLIENT_URL=https://<your-service>.onrender.com`.
4. Deploy and check `https://<your-service>.onrender.com/api/health`. Render's free tier sleeps after inactivity, so the first request can take 30–60 seconds.

## 13. Testing performed

- Production build of the client (`vite build`) succeeds.
- API tested with curl: health check, register/login/logout, validation errors on every form, invalid / missing ids, CRUD for all resources, filtering and sorting, dashboard stats.
- Security: users cannot read, download, delete or link another user's records (returns 404/400); tampered cookies are rejected; passwords are stored only as bcrypt hashes.
- Uploads: non-PDF types, text files renamed to `.pdf`, files over the size limit and missing files are rejected by the server; path-traversal file names are ignored (files are stored under random UUIDs); both `local` and `gridfs` drivers tested (upload → download → delete).
- Relationships: deleting a resume unlinks it from applications; deleting an application deletes its interviews.
- UI tested in the browser: all forms (valid and invalid input), modals, toasts, dashboard updates without refresh, resume linking, interview scheduling, search/filter, mobile drawer and card layouts.

## 14. Limitations and future scope

**Limitations**
- No email reminders or calendar sync — follow-ups and interviews are shown inside the app only.
- No password reset or email verification.
- With `STORAGE_DRIVER=local`, uploaded PDFs are lost on hosts with ephemeral disks (use `gridfs` there).
- One user role only; no sharing between users.

**Future scope**
- Email/push reminders for follow-ups and interviews; export to Google Calendar (.ics).
- Password reset and account deletion.
- Kanban board view with drag-and-drop status changes.
- Analytics over time (applications per week, response rate per resume version).
- Cloud object storage (e.g. S3 / Cloudinary) for larger files.
