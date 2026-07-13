import express from 'express'
import Question from '../models/Question.js'
import Response from '../models/Response.js'
import Room from '../models/Room.js'
import User from '../models/User.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

// Student submits an answer
router.post('/', requireRole('student'), async (req, res) => {
  try {
    const { questionId, selectedOption, responseTimeMs } = req.body
    if (typeof selectedOption !== 'number') {
      return res.status(400).json({ error: 'selectedOption (number) required' })
    }
    const question = await Question.findById(questionId)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    if (!question.isActive) return res.status(400).json({ error: 'Question is not active' })

    const isCorrect = question.correctOptionIndex !== null
      && selectedOption === question.correctOptionIndex

    // Speed bonus: faster = more points (linear scale based on timeLimit)
    let points = 0
    if (isCorrect) {
      const elapsed = (responseTimeMs || 0) / 1000
      const limit = question.timeLimit || 30
      const speedFactor = Math.max(0.2, 1 - (elapsed / limit) * 0.8)
      points = Math.round((question.points || 100) * speedFactor)
    }

    const response = await Response.findOneAndUpdate(
      { question: questionId, student: req.user._id },
      { selectedOption, isCorrect, pointsAwarded: points, responseTimeMs: responseTimeMs || 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (points > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalPoints: points } })
    }

    res.json({ response, isCorrect, pointsAwarded: points })
  } catch (err) {
    console.error('Submit response error:', err)
    res.status(500).json({ error: 'Failed to submit response' })
  }
})

// Aggregated results for a question (counts per option)
router.get('/results/:questionId', async (req, res) => {
  try {
    const results = await Response.aggregate([
      { $match: { question: new (await import('mongoose')).default.Types.ObjectId(req.params.questionId) } },
      { $group: { _id: '$selectedOption', count: { $sum: 1 } } },
      { $project: { _id: 0, option: '$_id', count: 1 } }
    ])
    const total = results.reduce((s, r) => s + r.count, 0)
    res.json({ results, total })
  } catch (err) {
    console.error('Results error:', err)
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

// Leaderboard for a room (top students by total points in that room)
router.get('/leaderboard/:roomId', async (req, res) => {
  try {
    const ObjectId = (await import('mongoose')).default.Types.ObjectId
    const leaderboard = await Response.aggregate([
      { $match: { room: new ObjectId(req.params.roomId) } },
      { $group: { _id: '$student', points: { $sum: '$pointsAwarded' } } },
      { $sort: { points: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { _id: 0, userId: '$user._id', name: '$user.name', points: 1 } }
    ])
    res.json({ leaderboard })
  } catch (err) {
    console.error('Leaderboard error:', err)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

export default router
