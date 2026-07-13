"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const shared_types_1 = require("@spandan/shared-types");
const validate_1 = require("../middleware/validate");
const User_1 = require("../models/User");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", (0, validate_1.validate)(shared_types_1.RegisterInputSchema), async (req, res) => {
    const { name, email, password, role } = req.body;
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.UserModel.create({ name, email, passwordHash, role });
    const token = signToken(user.id, user.role);
    res.status(201).json({ token, user: toPublicUser(user) });
});
exports.authRouter.post("/login", (0, validate_1.validate)(shared_types_1.LoginInputSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user.id, user.role);
    res.json({ token, user: toPublicUser(user) });
});
function signToken(id, role) {
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
    };
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, options);
}
function toPublicUser(user) {
    return { _id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}
