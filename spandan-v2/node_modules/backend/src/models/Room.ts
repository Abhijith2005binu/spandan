import { Schema, model, Document, Types } from "mongoose";

export interface RoomDocument extends Document {
  name: string;
  code: string;
  teacherId: Types.ObjectId;
  collaborators: Types.ObjectId[];
  status: "draft" | "active" | "closed";
  settings: {
    allowLateJoin: boolean;
    showLeaderboard: boolean;
    anonymousMode: boolean;
    questionTimerDefault: number;
  };
  createdAt: Date;
}

const roomSchema = new Schema<RoomDocument>({
  name: { type: String, required: true, maxlength: 100 },
  code: { type: String, required: true, unique: true, length: 6 },
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["draft", "active", "closed"], default: "draft" },
  settings: {
    allowLateJoin: { type: Boolean, default: true },
    showLeaderboard: { type: Boolean, default: true },
    anonymousMode: { type: Boolean, default: false },
    questionTimerDefault: { type: Number, default: 30 },
  },
  createdAt: { type: Date, default: Date.now },
});

export const RoomModel = model<RoomDocument>("Room", roomSchema);
