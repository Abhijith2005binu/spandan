import { z } from "zod";
export declare const RoleSchema: z.ZodEnum<["teacher", "student"]>;
export type Role = z.infer<typeof RoleSchema>;
export declare const UserSchema: z.ZodObject<{
    _id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["teacher", "student"]>;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    _id: string;
    name: string;
    email: string;
    role: "teacher" | "student";
    createdAt: Date;
}, {
    _id: string;
    name: string;
    email: string;
    role: "teacher" | "student";
    createdAt: Date;
}>;
export type User = z.infer<typeof UserSchema>;
export declare const RegisterInputSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["teacher", "student"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "teacher" | "student";
    password: string;
}, {
    name: string;
    email: string;
    role: "teacher" | "student";
    password: string;
}>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export declare const LoginInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export declare const AuthResponseSchema: z.ZodObject<{
    token: z.ZodString;
    user: z.ZodObject<{
        _id: z.ZodString;
        name: z.ZodString;
        email: z.ZodString;
        role: z.ZodEnum<["teacher", "student"]>;
        createdAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        _id: string;
        name: string;
        email: string;
        role: "teacher" | "student";
        createdAt: Date;
    }, {
        _id: string;
        name: string;
        email: string;
        role: "teacher" | "student";
        createdAt: Date;
    }>;
}, "strip", z.ZodTypeAny, {
    token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: "teacher" | "student";
        createdAt: Date;
    };
}, {
    token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: "teacher" | "student";
        createdAt: Date;
    };
}>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
