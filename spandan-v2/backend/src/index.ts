import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { roomsRouter } from "./routes/rooms";
import { registerSocketHandlers } from "./services/socket";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN, credentials: true },
});

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }) // tune per-route later for login specifically
);

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

registerSocketHandlers(io);

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    httpServer.listen(PORT, () => console.log(`Spandan backend listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });
