# Amar Dokan – Kolkata's E-commerce Builder

Ionic React app (web + optional native via Capacitor).

**Documentation:** [Developer Guide](docs/DEVELOPER.md) · [Deployment Guide](docs/DEPLOYMENT.md)

## Run as web app

**Full stack (API + client) — one port:**
```bash
npm install
npm run dev
```
Then open **http://localhost:5014**. The Express server listens on this port and serves both the API and the client (Vite runs as Express middleware, so there is no second dev-server port).

**Client only (no API):**
```bash
npm run dev:client
```
Then open **http://localhost:5173** (or 5174 if 5173 is in use). This starts a standalone Vite dev server. API calls from the client still go to `http://localhost:5014` unless you set `VITE_API_URL`; run `npm run dev` in another terminal if you need the API.

**Why two ports?** You see 5014 and 5173/5174 only if you run both `npm run dev` and `npm run dev:client`. For normal development, use **only** `npm run dev` — the client is served on the same port (5014) as the API.

**Production:**
```bash
npm run build
npm start
```
Serves the built client and API from the port set by `PORT` (default 5014).

---

## Run as native app (iOS / Android)

Uses [Capacitor](https://capacitorjs.com/) to wrap the web app.

### One-time setup

```bash
# Build the web app
npm run build

# Add Capacitor (if not already added)
npm install @capacitor/core @capacitor/cli
npx cap init "Amar Dokan" com.amardokan.app

# Add a platform
npx cap add ios
# and/or
npx cap add android
```

Point Capacitor at your built app. In `capacitor.config.ts` (or `capacitor.config.json`):

- **Development:** set `server.url` to your dev server (e.g. `http://localhost:5014`) to live-reload.
- **Production:** set `webDir` to your build output (e.g. `dist/public` for this project).

Example `capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amardokan.app',
  appName: 'Amar Dokan',
  webDir: 'dist/public',
  server: {
    // Uncomment for live reload during dev:
    // url: 'http://localhost:5014',
    // cleartext: true,
  },
};

export default config;
```

### Run on device / simulator

**iOS (mac only):**
```bash
npm run build
npx cap sync ios
npx cap open ios
```
Then run from Xcode on a simulator or device.

**Android:**
```bash
npm run build
npx cap sync android
npx cap open android
```
Then run from Android Studio on an emulator or device.

**Sync after changes:** after each `npm run build`, run `npx cap sync` (or `npx cap sync ios` / `npx cap sync android`) so the native project uses the latest build.
