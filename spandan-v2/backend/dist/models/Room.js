"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModel = void 0;
const mongoose_1 = require("mongoose");
const roomSchema = new mongoose_1.Schema({
    name: { type: String, required: true, maxlength: 100 },
    code: { type: String, required: true, unique: true, length: 6 },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["draft", "active", "closed"], default: "draft" },
    settings: {
        allowLateJoin: { type: Boolean, default: true },
        showLeaderboard: { type: Boolean, default: true },
        anonymousMode: { type: Boolean, default: false },
        questionTimerDefault: { type: Number, default: 30 },
    },
    createdAt: { type: Date, default: Date.now },
});
exports.RoomModel = (0, mongoose_1.model)("Room", roomSchema);
