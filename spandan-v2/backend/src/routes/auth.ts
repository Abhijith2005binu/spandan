import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { RegisterInputSchema, LoginInputSchema } from "@spandan/shared-types";
import { validate } from "../middleware/validate";
import { UserModel } from "../models/User";

export const authRouter = Router();

authRouter.post("/register", validate(RegisterInputSchema), async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, passwordHash, role });

  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: toPublicUser(user) });
});

authRouter.post("/login", validate(LoginInputSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user.id, user.role);
  res.json({ token, user: toPublicUser(user) });
});

function signToken(id: string, role: string) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, options);
}

function toPublicUser(user: any) {
  return { _id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
