"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseSchema = exports.LoginInputSchema = exports.RegisterInputSchema = exports.UserSchema = exports.RoleSchema = void 0;
const zod_1 = require("zod");
exports.RoleSchema = zod_1.z.enum(["teacher", "student"]);
exports.UserSchema = zod_1.z.object({
    _id: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(80),
    email: zod_1.z.string().email(),
    role: exports.RoleSchema,
    createdAt: zod_1.z.coerce.date(),
});
exports.RegisterInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: exports.RoleSchema,
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.AuthResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: exports.UserSchema,
});
