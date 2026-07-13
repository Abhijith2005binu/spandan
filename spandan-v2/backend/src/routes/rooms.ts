import { Router } from "express";
import { CreateRoomInputSchema } from "@spandan/shared-types";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { RoomModel } from "../models/Room";

export const roomsRouter = Router();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

roomsRouter.post(
  "/",
  requireAuth,
  requireRole("teacher"),
  validate(CreateRoomInputSchema),
  async (req: AuthedRequest, res) => {
    const { name, settings } = req.body;
    const room = await RoomModel.create({
      name,
      code: generateRoomCode(),
      teacherId: req.user!.id,
      settings,
    });
    res.status(201).json(room);
  }
);

roomsRouter.get("/", requireAuth, requireRole("teacher"), async (req: AuthedRequest, res) => {
  const rooms = await RoomModel.find({ teacherId: req.user!.id }).sort({ createdAt: -1 });
  res.json(rooms);
});

roomsRouter.get("/by-code/:code", requireAuth, async (req, res) => {
  const room = await RoomModel.findOne({ code: req.params.code.toUpperCase() });
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});
