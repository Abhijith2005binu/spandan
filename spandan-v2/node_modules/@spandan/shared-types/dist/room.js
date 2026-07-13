"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseSchema = exports.SessionSchema = exports.QuestionSchema = exports.QuestionStatusSchema = exports.QuestionTypeSchema = exports.CreateRoomInputSchema = exports.RoomSchema = exports.RoomSettingsSchema = exports.RoomStatusSchema = void 0;
const zod_1 = require("zod");
exports.RoomStatusSchema = zod_1.z.enum(["draft", "active", "closed"]);
exports.RoomSettingsSchema = zod_1.z.object({
    allowLateJoin: zod_1.z.boolean().default(true),
    showLeaderboard: zod_1.z.boolean().default(true),
    anonymousMode: zod_1.z.boolean().default(false),
    questionTimerDefault: zod_1.z.number().default(30),
});
exports.RoomSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
    code: zod_1.z.string().length(6),
    teacherId: zod_1.z.string(),
    collaborators: zod_1.z.array(zod_1.z.string()).default([]),
    status: exports.RoomStatusSchema,
    settings: exports.RoomSettingsSchema,
    createdAt: zod_1.z.coerce.date(),
});
exports.CreateRoomInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    settings: exports.RoomSettingsSchema.partial().optional(),
});
exports.QuestionTypeSchema = zod_1.z.enum(["mcq", "tf", "msq", "poll"]);
exports.QuestionStatusSchema = zod_1.z.enum([
    "pending_approval",
    "approved",
    "live",
    "closed",
]);
exports.QuestionSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    roomId: zod_1.z.string(),
    type: exports.QuestionTypeSchema,
    text: zod_1.z.string().min(1),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    correctAnswer: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]).optional(),
    source: zod_1.z.enum(["manual", "ai_generated", "transcription"]),
    status: exports.QuestionStatusSchema,
    timerSeconds: zod_1.z.number().default(30),
});
exports.SessionSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    roomId: zod_1.z.string(),
    startedAt: zod_1.z.coerce.date(),
    endedAt: zod_1.z.coerce.date().optional(),
    participantCount: zod_1.z.number().default(0),
});
exports.ResponseSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    sessionId: zod_1.z.string(),
    questionId: zod_1.z.string(),
    studentId: zod_1.z.string(),
    answer: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
    isCorrect: zod_1.z.boolean().optional(),
    submittedAt: zod_1.z.coerce.date(),
});
