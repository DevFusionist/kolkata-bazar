# Kolkata Bazar Builder — Deployment Guide

Step-by-step guide to deploy **Amar Dokan / Kolkata Bazar Builder** to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Build & Run](#build--run)
5. [Platform-Specific Deployment](#platform-specific-deployment)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** database (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), Railway, or self-hosted)
- **Twilio** account (for OTP during onboarding/login)

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Use pooled URL from Neon/Supabase. |
| `TWILIO_ACCOUNT_SID` | For OTP | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | For OTP | Twilio Auth Token |
| `TWILIO_VERIFY_SERVICE_SID` | For OTP | Twilio Verify Service SID (create in Verify > Services) |
| `SESSION_SECRET` | **Recommended** | Random string ≥16 chars. Required for persistent login sessions. |
| `PORT` | No | Server port (default: `5014`) |
| `CORS_ORIGIN` | No | Comma-separated allowed origins. Omit to reflect request origin. |
| `NODE_ENV` | Set by scripts | `production` for deployment |

### Example `.env`

```env
DATABASE_URL='postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=verify-full'
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET=your_random_secret_min_16_chars
PORT=5014
```

### SSL note for PostgreSQL

If you see SSL warnings, add `?sslmode=verify-full` to `DATABASE_URL`. The app normalizes `require`/`prefer`/`verify-ca` to `verify-full` automatically.

---

## Database Setup

### Option A: Apply migrations (recommended)

```bash
# Set DATABASE_URL first
export DATABASE_URL='postgresql://...'

# Generate migrations (if you changed schema)
npm run db:generate

# Push schema (creates tables; for fresh DB)
# Or use your DB provider's migration runner to run SQL from migrations/
npm run db:push
```

### Option B: Run SQL manually

If your platform doesn't support Drizzle, run the migration SQL files in `migrations/` in order (0000, 0001, 0002, 0003).

---

## Build & Run

### 1. Install dependencies

```bash
npm ci
```

### 2. Build

```bash
npm run build
```

This produces:
- `dist/public/` — Static client (HTML, JS, CSS)
- `dist/index.cjs` — Bundled Express server

### 3. Start

```bash
NODE_ENV=production npm start
# or
PORT=8080 NODE_ENV=production node dist/index.cjs
```

The server listens on `PORT` (default `5014`) and serves:
- API at `/api/*`
- SPA at `/*` (fallback to `index.html`)

---

## Platform-Specific Deployment

### Railway

1. Connect your GitHub repo.
2. Add PostgreSQL from Railway’s services.
3. Add Twilio env vars in Variables.
4. Set:
   - **Build command**: `npm run build`
   - **Start command**: `npm start`
   - **Root directory**: `.`
5. Add `DATABASE_URL` from the PostgreSQL service.
6. Deploy.

### Render

1. New **Web Service** from repo.
2. Environment: **Node**.
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add PostgreSQL (or external) and set `DATABASE_URL`.
6. Add Twilio + `SESSION_SECRET` env vars.
7. Deploy.

### Vercel

Vercel is optimized for serverless. For a long-running Express app, use **Vercel Serverless Functions** or deploy the Node server to Railway/Render and point a custom domain. For a quick deploy:

1. Use **Vercel + external Node host** — Deploy API to Railway/Render, deploy client to Vercel, set `VITE_API_URL` to API base URL.

### Docker

Example `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
EXPOSE 5014
CMD ["node", "dist/index.cjs"]
```

Build and run:

```bash
docker build -t kolkata-bazar .
docker run -p 5014:5014 --env-file .env kolkata-bazar
```

### Fly.io

1. Install `flyctl`.
2. `fly launch` — choose region.
3. Add Postgres: `fly postgres create` or attach existing.
4. Set secrets:
   ```bash
   fly secrets set DATABASE_URL=... TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_VERIFY_SERVICE_SID=... SESSION_SECRET=...
   ```
5. `fly deploy`

### Replit

Project includes Replit plugins. Set env vars in Secrets. Use `npm run dev` or `npm run build && npm start` as run command.

---

## Post-Deployment Checklist

- [ ] `DATABASE_URL` is set and migrations applied
- [ ] `SESSION_SECRET` is set (≥16 chars)
- [ ] Twilio vars set if OTP is required
- [ ] `CORS_ORIGIN` includes production domain if needed
- [ ] `PORT` matches platform (e.g. Railway uses `PORT`)
- [ ] HTTPS enabled (platform usually provides)
- [ ] Test: Create store, add product, view public store at `/store/:id`

### Custom domain

Point your domain to the app. Ensure `CORS_ORIGIN` includes `https://yourdomain.com` if the frontend is on a different subdomain.

---

## Native Mobile (Capacitor)

See main [README.md](../README.md) for Capacitor setup. Build the web app first, then:

```bash
npm run build
npx cap add ios   # and/or android
npx cap sync
npx cap open ios  # or android
```

For production, set `webDir` in `capacitor.config.ts` to `dist/public`.
