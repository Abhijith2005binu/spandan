"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModel = void 0;
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    roomId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Room", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    participantCount: { type: Number, default: 0 },
});
exports.SessionModel = (0, mongoose_1.model)("Session", sessionSchema);
