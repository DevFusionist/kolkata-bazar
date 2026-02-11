# Kolkata Bazar Builder — Developer Documentation

Developer-centric technical documentation for **Amar Dokan / Kolkata Bazar Builder**, an e-commerce store builder for Kolkata businesses. Stores are accessed via WhatsApp and rendered as customizable storefront pages.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Model & Schema](#data-model--schema)
5. [API Reference](#api-reference)
6. [Authentication Flow](#authentication-flow)
7. [Store Builder & Sections](#store-builder--sections)
8. [Build System](#build-system)
9. [Database Migrations](#database-migrations)
10. [Development Workflow](#development-workflow)
11. [Testing & Debugging](#testing--debugging)

---

## Architecture Overview

The application is a **monolithic full-stack** setup:

- **Server**: Express.js (Node) — API, session handling, serves static build in production
- **Client**: React + Ionic — SPA with store builder UI
- **Database**: PostgreSQL (via Drizzle ORM)
- **Single port**: Express listens on one port; Vite runs as middleware in dev; static files served in prod

```
┌─────────────────────────────────────────────────────────────┐
│                     Express Server (port 5014)               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ /api/*      │  │ Vite (dev)   │  │ Static (prod)       │ │
│  │ REST API    │  │ HMR middleware│  │ dist/public        │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ PostgreSQL      │     │ Twilio Verify    │
│ (Drizzle)       │     │ (OTP for auth)   │
└─────────────────┘     └──────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Ionic 8, React Router 5, TanStack Query, Framer Motion |
| **Styling** | Tailwind CSS 4, Ionic components |
| **Build** | Vite 7, esbuild (server bundle) |
| **Backend** | Express 5, Node.js |
| **Database** | PostgreSQL (Neon/compatible), Drizzle ORM |
| **Auth** | Session cookies (kb_session), Twilio Verify (OTP), MPIN (scrypt) |
| **Validation** | Zod (shared between client/server) |
| **Types** | TypeScript 5.6 |

---

## Project Structure

```
Kolkata-bazar-builder/
├── client/                 # React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   │   ├── Layout.tsx
│   │   │   ├── StorePageRenderer.tsx   # Renders storefront from pageConfig
│   │   │   ├── store-builder/          # Section editor, template picker
│   │   │   └── store-sections/         # Section components (hero, cta, products, etc.)
│   │   ├── hooks/         # useMobile, useToast
│   │   ├── lib/           # api.ts, store.ts, queryClient, utils
│   │   ├── pages/         # Route components (home, dashboard, onboarding, store, login)
│   │   └── theme/         # CSS variables
│   ├── index.html
│   └── public/            # Static assets
├── server/
│   ├── index.ts           # Express app, CORS, routes, Vite/static setup
│   ├── routes.ts           # All /api/* handlers
│   ├── db.ts               # Drizzle pool (DATABASE_URL)
│   ├── storage.ts          # DrizzleStorage (stores, products, owners)
│   ├── static.ts           # Serves dist/public in production
│   ├── twilio.ts           # Twilio Verify OTP send/verify
│   └── vite.ts             # Vite dev middleware
├── shared/
│   ├── schema.ts           # Drizzle schema, Zod schemas, section types, PageConfig
│   └── templates.ts        # STORE_TEMPLATES (minimal, boutique, food, classic)
├── migrations/             # Drizzle migrations (SQL)
├── script/build.ts         # Vite client build + esbuild server bundle
├── drizzle.config.ts       # Drizzle Kit config (needs DATABASE_URL)
├── vite.config.ts          # Vite config (client root, aliases)
├── .env.example            # Environment variables template
└── docs/                   # Documentation
```

---

## Data Model & Schema

### Entities

| Table | Purpose |
|-------|---------|
| `users` | Legacy/optional auth (username/password) |
| `store_owners` | Mobile + scrypt MPIN hash — one per store for ownership |
| `stores` | Name, type, whatsapp (unique), ownerId, ownerToken, templateId, pageConfig |
| `products` | storeId, name, price, image, description, sortOrder |

### Key Schema (`shared/schema.ts`)

**Section types** (used in `pageConfig.sections`):

- `hero` — HeroProps: title, subtitle, image, ctaText
- `products_grid` — ProductsGridProps: columns (2\|3), showPrices
- `cta` — CtaProps: title, buttonText, whatsappPrefill
- `text` — TextProps: content, align
- `banner` — BannerProps: image, link, alt
- `features` — FeaturesProps: items[{ icon, title, description }]

**PageConfig**:

```ts
type PageConfig = {
  sections: Array<{ id: string; type: SectionType; props?: Record<string, unknown> }>;
};
```

**Business types**: `saree`, `food`, `beauty`, `electronics`, `handmade`, `other`

### Indexes

- `stores_whatsapp_idx`, `stores_owner_id_idx`
- `products_store_id_idx`

---

## API Reference

All endpoints are under `/api`. Responses are JSON unless noted. Auth uses `credentials: "include"` (cookies) and optional header `x-store-owner-token`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/send-otp` | `{ mobile }` — Send OTP for onboarding. 409 if number already has a store. |
| POST | `/auth/verify-otp-onboarding` | `{ mobile, otp }` — Verify OTP, set `kb_onboarding_phone` cookie |
| POST | `/auth/login-with-mpin` | `{ mobile, mpin }` — Login existing store owner, set session |
| GET | `/auth/me` | Returns `{ store, ownerToken }` if session valid |
| POST | `/auth/logout` | Clears session cookies |

### Stores

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stores` | Create store — `{ name, type, whatsapp, mpin?, templateId?, pageConfig? }`. Requires onboarding cookie when using mpin. |
| GET | `/stores/:id` | Get store + products by ID (public) |
| GET | `/stores/by-whatsapp/:whatsapp` | Get store + products by WhatsApp number (public) |
| PATCH | `/stores/:id` | Update store — requires `x-store-owner-token` or session |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stores/:storeId/products` | Add product — `{ name, price, image?, description? }` — requires owner token/session |
| DELETE | `/stores/:storeId/products/:productId` | Delete product — requires owner token/session |

### Validation

- Zod schemas from `shared/schema.ts` (`insertStoreSchema`, `storeDesignSchema`, etc.)
- `validateBody(schema)` middleware in `routes.ts`

---

## Authentication Flow

### Onboarding (new store)

1. User enters mobile → `POST /auth/send-otp`
2. User enters OTP → `POST /auth/verify-otp-onboarding` → sets `kb_onboarding_phone` cookie
3. User submits store form with MPIN → `POST /stores` with mpin → creates store + owner, sets `kb_session` cookie
4. Client stores `storeId` + `ownerToken` in localStorage for API calls

### Login (existing store)

1. User enters mobile + MPIN → `POST /auth/login-with-mpin`
2. Server verifies MPIN via `scrypt`, sets `kb_session` cookie
3. Client stores `storeId` + `ownerToken` in localStorage

### Session

- Cookie: `kb_session` — signed payload `storeId|ownerToken` (HMAC-SHA256)
- Secret: `SESSION_SECRET` (min 16 chars)
- Owner token: random 64-char hex, used for product/store updates via `x-store-owner-token`

### Phone normalization

- All WhatsApp numbers stored as `91XXXXXXXXXX` (no `+`)
- Twilio Verify uses E.164 (`+919876543210`)

---

## Store Builder & Sections

### Flow

1. **Onboarding** → User picks template from `STORE_TEMPLATES` (minimal, boutique, food, classic)
2. **Dashboard Design** → Edit sections via `SectionEditor`, `SectionPropsEditor`, `TemplatePicker`
3. **Store page** → `StorePageRenderer` maps `pageConfig.sections` to `RenderSection` → renders `SectionHero`, `SectionProductsGrid`, `SectionCta`, etc.

### Adding a new section type

1. Add type to `SECTION_TYPES` and props type in `shared/schema.ts`
2. Create `SectionX.tsx` in `client/src/components/store-sections/`
3. Add case in `RenderSection` in `store-sections/index.tsx`
4. Add editor UI in `SectionPropsEditor.tsx` if needed
5. Optionally add to a template in `shared/templates.ts`

---

## Build System

### Scripts (`package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `NODE_ENV=development tsx watch server/index.ts` | Full stack on single port (5014) |
| `dev:client` | `vite dev` | Client-only dev server (5173) |
| `build` | `tsx script/build.ts` | Vite client build + esbuild server bundle |
| `start` | `NODE_ENV=production node dist/index.cjs` | Production server |
| `db:generate` | `drizzle-kit generate` | Generate migrations |
| `db:push` | `drizzle-kit push` | Push schema to DB (no migration files) |
| `db:studio` | `drizzle-kit studio` | Drizzle Studio UI |
| `check` | `tsc` | TypeScript check |

### Build output

- **Client**: `dist/public/` (Vite)
- **Server**: `dist/index.cjs` (esbuild, CJS)

### Environment

- `NODE_ENV` — `development` | `production`
- `VITE_API_URL` — API base for client (default `http://localhost:5014`)

---

## Database Migrations

- Migrations live in `migrations/`
- Generated with: `DATABASE_URL=... npm run db:generate`
- Applied via Drizzle or your deployment pipeline
- `drizzle.config.ts` reads `DATABASE_URL` — required for generate/push/studio

---

## Development Workflow

1. Clone repo, `npm install`
2. Copy `.env.example` → `.env`, set `DATABASE_URL` (and Twilio vars for OTP)
3. Run migrations or `npm run db:push`
4. `npm run dev` — app at `http://localhost:5014`
5. For client-only dev: `npm run dev:client` (API at 5014); set `VITE_API_URL` if API is elsewhere

### Path aliases

- `@/` → `client/src/`
- `@shared` → `shared/`

---

## Testing & Debugging

- **API logs**: All `/api` requests are logged with method, path, status, duration
- **Drizzle Studio**: `npm run db:studio` to inspect DB
- **Session debugging**: Check `kb_session` cookie (signed); decode payload to see `storeId|ownerToken`
- **Twilio**: If OTP fails, verify `TWILIO_*` env vars and Verify service; Twilio Console shows delivery status

---

## Contributing

When modifying:

- Schema changes → update `shared/schema.ts`, run `db:generate`, add migration
- New API route → add to `server/routes.ts`, mirror in `client/src/lib/api.ts`
- New section type → follow [Adding a new section type](#adding-a-new-section-type)
