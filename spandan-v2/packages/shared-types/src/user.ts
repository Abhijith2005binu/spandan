import { z } from "zod";

export const RoleSchema = z.enum(["teacher", "student"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string().min(1).max(80),
  email: z.string().email(),
  role: RoleSchema,
  createdAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const RegisterInputSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  role: RoleSchema,
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
