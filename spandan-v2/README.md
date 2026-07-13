---

## Prerequisites

- **Node.js 18 or later** — check with `node -v`
- **MongoDB**, one of:
  - Local install with `mongod` running, or
  - A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (no local install needed)

---

## Setup

Run these once, in order, from the project root.

**1. Install all workspace dependencies**
```bash
npm install
```
This installs `packages/shared-types`, `backend`, and `frontend` together — npm workspaces automatically link `@spandan/shared-types` into the other two, no manual symlinking needed.

**2. Build the shared-types package**
```bash
npm run build --workspace=packages/shared-types
```
Both apps import compiled output from here, so this must run before either app starts, and again any time you edit files in `packages/shared-types/src`.

**3. Configure backend environment**
```bash
cp backend/.env.example backend/.env
```
Then edit `backend/.env` — see [Environment Variables](#environment-variables) below for what to set.

---

## Running the App

Two terminals, both from the project root.

**Terminal 1 — backend**
```bash
npm run dev:backend
```
Expected output: `Spandan backend listening on :3001`

**Terminal 2 — frontend**
```bash
npm run dev:frontend
```
Expected output includes a `Local: http://localhost:5173/` line.

Open **http://localhost:5173** — you should see the dark-themed Teacher Dashboard. The Vite dev server proxies `/api` and `/socket.io` requests to port 3001 automatically (configured in `vite.config.ts`), so there's no CORS setup needed in local dev.

---

## Verifying It Works

```bash
curl http://localhost:3001/api/health
```
Expected response: `{"ok":true}`

If that returns successfully but the frontend page is blank or shows fetch errors, the backend is fine — the issue is on the frontend side (check the browser console).

---

## Environment Variables

Set in `backend/.env`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/spandan_v2` or an Atlas URI |
| `JWT_SECRET` | Long random string for signing tokens — **change from the placeholder** | any long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CORS_ORIGIN` | Frontend origin allowed to call the API | `http://localhost:5173` |

---

## What's Built vs. Stubbed

**Working:**
- User register/login with JWT (`backend/src/routes/auth.ts`)
- Room create/list/lookup-by-code (`backend/src/routes/rooms.ts`)
- Socket.IO connection, room join/leave, live presence count
- Teacher Dashboard UI shell with dark matte design tokens

**Stubbed — marked `TODO` in code, this is the actual next-phase work:**
- `room:join` treats `roomCode` as `roomId` directly — needs a real `RoomModel.findOne({ code })` lookup before broadcasting to the right Socket.IO room
- `response:submit` doesn't persist answers yet — no `Response` model or route exists
- No `Question` model/routes yet
- No student-facing pages — only the teacher side is scaffolded so this first version stays reviewable
- No AI layer yet (question generation, transcription, difficulty tagging)

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Cannot find module '@spandan/shared-types'` | Shared-types package wasn't built | Run `npm run build --workspace=packages/shared-types` |
| Backend crashes immediately, Mongo connection error | `mongod` not running, or wrong `MONGODB_URI` | Start MongoDB locally, or double-check your Atlas connection string |
| `npm install` fails referencing workspace protocol | Node version too old | Upgrade to Node 18+ |
| Frontend loads but all API calls fail | Backend isn't running, or wrong port | Confirm Terminal 1 shows `listening on :3001` |
| Login/register returns 500 error | `JWT_SECRET` missing from `.env` | Confirm `backend/.env` exists and has a value set |

If you hit something not listed here, paste the exact terminal output for a direct fix rather than guessing.

---

## Roadmap / Next Steps

Closing the core loop (join room → see live question → submit answer → teacher sees live tally) is the single highest-priority next step, in this order:

1. Fix `room:join` to resolve `roomCode` → actual `RoomModel` document
2. Build `Question` model + routes (create, approve, go-live)
3. Build `Response` model + persist logic in `response:submit`
4. Build the student-facing join/answer pages
5. Layer in AI question generation, transcription, and difficulty tagging