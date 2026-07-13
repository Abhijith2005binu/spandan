import { Schema, model, Document, Types } from "mongoose";

export interface SessionDocument extends Document {
  roomId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  participantCount: number;
}

const sessionSchema = new Schema<SessionDocument>({
  roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  participantCount: { type: Number, default: 0 },
});

export const SessionModel = model<SessionDocument>("Session", sessionSchema);
