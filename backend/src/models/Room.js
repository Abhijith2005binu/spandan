import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, length: 6 },
  name: { type: String, required: true, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  endedAt: { type: Date, default: null },
  settings: {
    questionProvider: { type: String, default: 'minimax' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)
