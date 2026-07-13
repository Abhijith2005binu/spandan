import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@spandan/shared-types";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

// roomId -> set of connected userIds (in-memory presence; fine at this scale,
// move to Redis only if you outgrow a single Node process)
const roomPresence = new Map<string, Set<string>>();

export function registerSocketHandlers(io: TypedServer) {
  io.on("connection", (socket) => {
    socket.on("room:join", async ({ roomCode, userId }) => {
      const roomId = roomCode; // resolve to actual room _id in real handler via RoomModel lookup
      socket.join(roomId);

      const members = roomPresence.get(roomId) ?? new Set();
      members.add(userId);
      roomPresence.set(roomId, members);

      socket.emit("room:joined", { roomId, participantCount: members.size });
      io.to(roomId).emit("room:presence", { participantCount: members.size });
    });

    socket.on("room:leave", ({ roomId, userId }) => {
      socket.leave(roomId);
      roomPresence.get(roomId)?.delete(userId);
      io.to(roomId).emit("room:presence", {
        participantCount: roomPresence.get(roomId)?.size ?? 0,
      });
    });

    socket.on("response:submit", ({ questionId, answer }) => {
      // TODO: persist to ResponseModel, then recompute + broadcast tally
      // io.to(roomId).emit("response:tally", { questionId, counts });
    });

    socket.on("confusion:flag", ({ roomId }) => {
      // TODO: increment a per-question or per-room confusion counter
      io.to(roomId).emit("confusion:flagged", { count: 1 });
    });

    socket.on("disconnect", () => {
      // TODO: remove from whichever roomPresence set this socket's userId was in
    });
  });
}
