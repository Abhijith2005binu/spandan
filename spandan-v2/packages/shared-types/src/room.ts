import { z } from "zod";

export const RoomStatusSchema = z.enum(["draft", "active", "closed"]);

export const RoomSettingsSchema = z.object({
  allowLateJoin: z.boolean().default(true),
  showLeaderboard: z.boolean().default(true),
  anonymousMode: z.boolean().default(false),
  questionTimerDefault: z.number().default(30),
});

export const RoomSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(100),
  code: z.string().length(6),
  teacherId: z.string(),
  collaborators: z.array(z.string()).default([]),
  status: RoomStatusSchema,
  settings: RoomSettingsSchema,
  createdAt: z.coerce.date(),
});
export type Room = z.infer<typeof RoomSchema>;

export const CreateRoomInputSchema = z.object({
  name: z.string().min(1).max(100),
  settings: RoomSettingsSchema.partial().optional(),
});
export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>;

export const QuestionTypeSchema = z.enum(["mcq", "tf", "msq", "poll"]);
export const QuestionStatusSchema = z.enum([
  "pending_approval",
  "approved",
  "live",
  "closed",
]);

export const QuestionSchema = z.object({
  _id: z.string(),
  roomId: z.string(),
  type: QuestionTypeSchema,
  text: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  source: z.enum(["manual", "ai_generated", "transcription"]),
  status: QuestionStatusSchema,
  timerSeconds: z.number().default(30),
});
export type Question = z.infer<typeof QuestionSchema>;

export const SessionSchema = z.object({
  _id: z.string(),
  roomId: z.string(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  participantCount: z.number().default(0),
});
export type Session = z.infer<typeof SessionSchema>;

export const ResponseSchema = z.object({
  _id: z.string(),
  sessionId: z.string(),
  questionId: z.string(),
  studentId: z.string(),
  answer: z.union([z.string(), z.array(z.string())]),
  isCorrect: z.boolean().optional(),
  submittedAt: z.coerce.date(),
});
export type ResponseRecord = z.infer<typeof ResponseSchema>;
