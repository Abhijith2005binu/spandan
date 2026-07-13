import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selectedOption: { type: Number, required: true },
  isCorrect: { type: Boolean, default: false },
  pointsAwarded: { type: Number, default: 0 },
  responseTimeMs: { type: Number, default: 0 }
}, { timestamps: true })

responseSchema.index({ question: 1, student: 1 }, { unique: true })

export default mongoose.model('Response', responseSchema)
