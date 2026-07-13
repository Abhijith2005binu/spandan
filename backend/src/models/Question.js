import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false }
}, { _id: false })

const questionSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  type: { type: String, enum: ['MCQ', 'TF', 'POLL'], default: 'MCQ' },
  question: { type: String, required: true },
  options: { type: [optionSchema], validate: v => v.length >= 2 },
  correctOptionIndex: { type: Number, default: null },
  explanation: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  launchedAt: { type: Date, default: null },
  closesAt: { type: Date, default: null },
  timeLimit: { type: Number, default: 30 }, // seconds
  points: { type: Number, default: 100 }
}, { timestamps: true })

export default mongoose.model('Question', questionSchema)
