"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomsRouter = void 0;
const express_1 = require("express");
const shared_types_1 = require("@spandan/shared-types");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const Room_1 = require("../models/Room");
exports.roomsRouter = (0, express_1.Router)();
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
exports.roomsRouter.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("teacher"), (0, validate_1.validate)(shared_types_1.CreateRoomInputSchema), async (req, res) => {
    const { name, settings } = req.body;
    const room = await Room_1.RoomModel.create({
        name,
        code: generateRoomCode(),
        teacherId: req.user.id,
        settings,
    });
    res.status(201).json(room);
});
exports.roomsRouter.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("teacher"), async (req, res) => {
    const rooms = await Room_1.RoomModel.find({ teacherId: req.user.id }).sort({ createdAt: -1 });
    res.json(rooms);
});
exports.roomsRouter.get("/by-code/:code", auth_1.requireAuth, async (req, res) => {
    const room = await Room_1.RoomModel.findOne({ code: req.params.code.toUpperCase() });
    if (!room)
        return res.status(404).json({ error: "Room not found" });
    res.json(room);
});
