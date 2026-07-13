import { z } from "zod";
export declare const RoomStatusSchema: z.ZodEnum<["draft", "active", "closed"]>;
export declare const RoomSettingsSchema: z.ZodObject<{
    allowLateJoin: z.ZodDefault<z.ZodBoolean>;
    showLeaderboard: z.ZodDefault<z.ZodBoolean>;
    anonymousMode: z.ZodDefault<z.ZodBoolean>;
    questionTimerDefault: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    allowLateJoin: boolean;
    showLeaderboard: boolean;
    anonymousMode: boolean;
    questionTimerDefault: number;
}, {
    allowLateJoin?: boolean | undefined;
    showLeaderboard?: boolean | undefined;
    anonymousMode?: boolean | undefined;
    questionTimerDefault?: number | undefined;
}>;
export declare const RoomSchema: z.ZodObject<{
    _id: z.ZodString;
    name: z.ZodString;
    code: z.ZodString;
    teacherId: z.ZodString;
    collaborators: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodEnum<["draft", "active", "closed"]>;
    settings: z.ZodObject<{
        allowLateJoin: z.ZodDefault<z.ZodBoolean>;
        showLeaderboard: z.ZodDefault<z.ZodBoolean>;
        anonymousMode: z.ZodDefault<z.ZodBoolean>;
        questionTimerDefault: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        allowLateJoin: boolean;
        showLeaderboard: boolean;
        anonymousMode: boolean;
        questionTimerDefault: number;
    }, {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    }>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    code: string;
    status: "draft" | "active" | "closed";
    _id: string;
    name: string;
    createdAt: Date;
    teacherId: string;
    collaborators: string[];
    settings: {
        allowLateJoin: boolean;
        showLeaderboard: boolean;
        anonymousMode: boolean;
        questionTimerDefault: number;
    };
}, {
    code: string;
    status: "draft" | "active" | "closed";
    _id: string;
    name: string;
    createdAt: Date;
    teacherId: string;
    settings: {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    };
    collaborators?: string[] | undefined;
}>;
export type Room = z.infer<typeof RoomSchema>;
export declare const CreateRoomInputSchema: z.ZodObject<{
    name: z.ZodString;
    settings: z.ZodOptional<z.ZodObject<{
        allowLateJoin: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        showLeaderboard: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        anonymousMode: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        questionTimerDefault: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    }, {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    settings?: {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    } | undefined;
}, {
    name: string;
    settings?: {
        allowLateJoin?: boolean | undefined;
        showLeaderboard?: boolean | undefined;
        anonymousMode?: boolean | undefined;
        questionTimerDefault?: number | undefined;
    } | undefined;
}>;
export type CreateRoomInput = z.infer<typeof CreateRoomInputSchema>;
export declare const QuestionTypeSchema: z.ZodEnum<["mcq", "tf", "msq", "poll"]>;
export declare const QuestionStatusSchema: z.ZodEnum<["pending_approval", "approved", "live", "closed"]>;
export declare const QuestionSchema: z.ZodObject<{
    _id: z.ZodString;
    roomId: z.ZodString;
    type: z.ZodEnum<["mcq", "tf", "msq", "poll"]>;
    text: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctAnswer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    difficulty: z.ZodOptional<z.ZodEnum<["easy", "medium", "hard"]>>;
    source: z.ZodEnum<["manual", "ai_generated", "transcription"]>;
    status: z.ZodEnum<["pending_approval", "approved", "live", "closed"]>;
    timerSeconds: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "mcq" | "tf" | "msq" | "poll";
    status: "closed" | "pending_approval" | "approved" | "live";
    _id: string;
    roomId: string;
    text: string;
    source: "manual" | "ai_generated" | "transcription";
    timerSeconds: number;
    options?: string[] | undefined;
    correctAnswer?: string | string[] | undefined;
    difficulty?: "easy" | "medium" | "hard" | undefined;
}, {
    type: "mcq" | "tf" | "msq" | "poll";
    status: "closed" | "pending_approval" | "approved" | "live";
    _id: string;
    roomId: string;
    text: string;
    source: "manual" | "ai_generated" | "transcription";
    options?: string[] | undefined;
    correctAnswer?: string | string[] | undefined;
    difficulty?: "easy" | "medium" | "hard" | undefined;
    timerSeconds?: number | undefined;
}>;
export type Question = z.infer<typeof QuestionSchema>;
export declare const SessionSchema: z.ZodObject<{
    _id: z.ZodString;
    roomId: z.ZodString;
    startedAt: z.ZodDate;
    endedAt: z.ZodOptional<z.ZodDate>;
    participantCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    _id: string;
    roomId: string;
    startedAt: Date;
    participantCount: number;
    endedAt?: Date | undefined;
}, {
    _id: string;
    roomId: string;
    startedAt: Date;
    endedAt?: Date | undefined;
    participantCount?: number | undefined;
}>;
export type Session = z.infer<typeof SessionSchema>;
export declare const ResponseSchema: z.ZodObject<{
    _id: z.ZodString;
    sessionId: z.ZodString;
    questionId: z.ZodString;
    studentId: z.ZodString;
    answer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    isCorrect: z.ZodOptional<z.ZodBoolean>;
    submittedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    _id: string;
    sessionId: string;
    questionId: string;
    studentId: string;
    answer: string | string[];
    submittedAt: Date;
    isCorrect?: boolean | undefined;
}, {
    _id: string;
    sessionId: string;
    questionId: string;
    studentId: string;
    answer: string | string[];
    submittedAt: Date;
    isCorrect?: boolean | undefined;
}>;
export type ResponseRecord = z.infer<typeof ResponseSchema>;
