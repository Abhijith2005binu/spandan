"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("./routes/auth");
const rooms_1 = require("./routes/rooms");
const socket_1 = require("./services/socket");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN, credentials: true },
});
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN }));
app.use(express_1.default.json());
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 300 }) // tune per-route later for login specifically
);
app.use("/api/auth", auth_1.authRouter);
app.use("/api/rooms", rooms_1.roomsRouter);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
(0, socket_1.registerSocketHandlers)(io);
const PORT = process.env.PORT || 3001;
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    httpServer.listen(PORT, () => console.log(`Spandan backend listening on :${PORT}`));
})
    .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
});
