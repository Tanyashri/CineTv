# CineVerse AI

> 🎬 Full-stack SaaS movie recommendation platform powered by AI.

## Architecture

```
cineverse-ai/
├── backend/          # Express.js + TypeScript API
│   ├── .env          # Backend-specific environment variables (DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.)
│   ├── .env.example  # Backend environment template
│   ├── prisma/       # Database schema & migrations
│   └── src/
│       ├── auth/     # Authentication service, controllers, routes & middleware
│       ├── cache/    # Stage 2 PostgreSQL cache (MovieEnrichmentCache)
│       ├── config/   # Environment (Zod fail-fast), Supabase & Swagger config
│       ├── constants/# HTTP status, roles, messages
│       ├── controllers/
│       ├── database/ # Prisma client (Supabase PostgreSQL)
│       ├── middleware/# Error handler, validation, rate limiting, request tracker
│       ├── pipeline/ # AI pipeline placeholder
│       ├── routes/
│       ├── schemas/  # Zod validation schemas (Auth & Common)
│       ├── services/
│       ├── types/
│       └── utils/    # Logger, SSE, errors
├── frontend/         # React 19 + Vite + Tailwind v4
│   ├── .env          # Public frontend environment variables (VITE_* only)
│   ├── .env.example  # Frontend environment template
│   └── src/
│       ├── components/# UI components & ProtectedRoute guard
│       ├── config/    # Frontend environment Zod validation
│       ├── contexts/  # AuthContext & AuthProvider
│       ├── hooks/
│       ├── layouts/
│       ├── pages/     # Login, Register, Forgot/Reset Password, Verify Email, Profile, Home, Health
│       ├── services/  # API Client, Supabase Client & FrontendAuthService
│       └── types/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Environment Variable Architecture

To maintain strict security isolation, environment variables are clean, standardized, and strictly compartmentalized:

### 1. Root Directory (`.env`)
- **Status**: **Removed / Not Required**.
- The root directory contains no running runtime processes. All credentials live strictly within their respective workspace environment files.

---

### 2. Backend Environment (`backend/.env` & `backend/.env.example`)
Contains ALL server-side credentials, database URLs, Supabase admin keys, JWT secrets, and external API keys.

```env
# Server
NODE_ENV=development
PORT=4000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase Admin API Credentials
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# External APIs
TMDB_API_KEY=your-tmdb-api-key
GEMINI_API_KEY=your-gemini-api-key
WIKIPEDIA_API_BASE=https://en.wikipedia.org/w/api.php

# CORS & Logging
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

> ⚠️ The backend process enforces **fail-fast Zod validation** via `backend/src/config/env.ts`. Startup aborts immediately if any required variable is missing or malformed.

---

### 3. Frontend Environment (`frontend/.env` & `frontend/.env.example`)
Contains ONLY public browser-safe variables starting with `VITE_`. No secrets (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_ACCESS_SECRET`, `GOOGLE_CLIENT_SECRET`, etc.) are exposed.

```env
# Public Frontend Variables Only
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> ⚠️ The frontend client validates `VITE_*` variables on initialization via `frontend/src/config/env.ts`.

---

## Authentication API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register new user with email, password, and optional full name |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & return Supabase access session |
| `POST` | `/api/v1/auth/logout` | Protected | Invalidate session & logout user |
| `POST` | `/api/v1/auth/forgot-password` | Public | Send password reset link to user email |
| `POST` | `/api/v1/auth/reset-password` | Public/Protected | Reset password using recovery token |
| `GET`  | `/api/v1/auth/me` | Protected | Get authenticated user profile from Prisma database |
| `PUT`  | `/api/v1/auth/profile` | Protected | Update user profile (`fullName`, `avatarUrl`) |
| `GET`  | `/api/v1/auth/google` | Public | Get Google OAuth redirect URL |

---

## Local Development Guide

### Prerequisites

- **Node.js**: `≥ 20.0.0`
- **npm**: `≥ 10.0.0`
- **Supabase Account**: [https://supabase.com](https://supabase.com)

---

### Step-by-Step Setup

```bash
# Clone the repository
git clone <repo-url>
cd cineverse-ai

# Install workspace dependencies
npm install

# Setup backend environment file
cp backend/.env.example backend/.env
# Fill in your database and Supabase credentials in backend/.env

# Setup frontend environment file
cp frontend/.env.example frontend/.env
# Fill in public VITE_ variables in frontend/.env

# Apply Prisma schema to PostgreSQL database
npm run db:push --workspace=backend

# Generate Prisma Client
npm run db:generate --workspace=backend

# Run type check & unit tests
npm run typecheck
npm run test:backend

# Start backend & frontend concurrently
npm run dev
```

---

## Workspace Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend concurrently |
| `npm run dev:backend` | Start backend dev server (`http://localhost:4000`) |
| `npm run dev:frontend` | Start frontend dev server (`http://localhost:5173`) |
| `npm run build` | Build all workspace packages |
| `npm run typecheck` | Run TypeScript type checks across all workspaces |
| `npm run test` | Run tests across all workspaces |
| `npm run test:backend` | Run backend Vitest test suite |
| `npm run test:frontend` | Run frontend Vitest test suite |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema changes to PostgreSQL |

---

## License

Private — All rights reserved.
