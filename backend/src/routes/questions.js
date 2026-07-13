import express from 'express'
import Question from '../models/Question.js'
import Room from '../models/Room.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()
router.use(authenticate)

// Generate questions from a transcript using MiniMax
router.post('/generate', requireRole('teacher'), async (req, res) => {
  try {
    const { transcript, count = 2, difficulty = 'medium', provider = 'minimax' } = req.body
    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({ error: 'Transcript is required (min 10 chars)' })
    }

    if (!process.env.MINIMAX_API_KEY) {
      return res.status(500).json({ error: 'MINIMAX_API_KEY not configured on server' })
    }

    const prompt = `You are an expert quiz generator. Generate exactly ${count} multiple choice questions from this transcript.

DIFFICULTY: ${difficulty.toUpperCase()}

TRANSCRIPT:
"""
${transcript}
"""

Respond ONLY with valid JSON in this exact format (no markdown, no commentary):
{
  "questions": [
    {
      "type": "MCQ",
      "question": "...",
      "options": [
        { "text": "Option A", "isCorrect": false },
        { "text": "Option B", "isCorrect": true },
        { "text": "Option C", "isCorrect": false },
        { "text": "Option D", "isCorrect": false }
      ],
      "explanation": "...",
      "correctOptionIndex": 1
    }
  ]
}

Rules:
- Each question has 4 options (A B C D)
- Exactly ONE option isCorrect:true per MCQ
- correctOptionIndex is the 0-based index of the correct option
- Questions must be based ONLY on the transcript content
- Make wrong options plausible but clearly incorrect`

    const url = `${process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1'}/text/chatcompletion_v2`
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MINIMAX_MODEL || 'MiniMax-Text-01',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      console.error('MiniMax API error:', apiRes.status, errText)
      return res.status(502).json({
        error: `AI provider error (${apiRes.status})`,
        detail: errText.substring(0, 500)
      })
    }

    const data = await apiRes.json()
    const content = data?.choices?.[0]?.message?.content || ''

    // Try to extract JSON from the response (handle markdown code fences)
    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch (e) {
      console.error('Failed to parse AI response:', content)
      return res.status(502).json({ error: 'AI returned invalid JSON', raw: content.substring(0, 500) })
    }

    res.json({ questions: parsed.questions || [] })
  } catch (err) {
    console.error('Generate questions error:', err)
    res.status(500).json({ error: 'Failed to generate questions' })
  }
})

// Save a question to a room
router.post('/', requireRole('teacher'), async (req, res) => {
  try {
    const { roomId, type, question, options, correctOptionIndex, explanation, timeLimit, points } = req.body
    if (!roomId || !question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const room = await Room.findOne({ _id: roomId, teacher: req.user._id })
    if (!room) return res.status(404).json({ error: 'Room not found' })

    const q = await Question.create({
      room: roomId,
      type: type || 'MCQ',
      question,
      options,
      correctOptionIndex: correctOptionIndex ?? null,
      explanation: explanation || '',
      timeLimit: timeLimit || 30,
      points: points || 100
    })
    res.json({ question: q })
  } catch (err) {
    console.error('Save question error:', err)
    res.status(500).json({ error: 'Failed to save question' })
  }
})

// List questions for a room
router.get('/', async (req, res) => {
  try {
    const { roomId } = req.query
    if (!roomId) return res.status(400).json({ error: 'roomId required' })
    const questions = await Question.find({ room: roomId }).sort({ createdAt: 1 })
    res.json({ questions })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

// Launch a question (mark active, deactivate others)
router.post('/:id/launch', requireRole('teacher'), async (req, res) => {
  try {
    const q = await Question.findById(req.params.id)
    if (!q) return res.status(404).json({ error: 'Question not found' })
    const room = await Room.findOne({ _id: q.room, teacher: req.user._id })
    if (!room) return res.status(403).json({ error: 'Not authorized' })

    await Question.updateMany({ room: q.room }, { $set: { isActive: false } })
    q.isActive = true
    q.launchedAt = new Date()
    q.closesAt = new Date(Date.now() + (q.timeLimit || 30) * 1000)
    await q.save()
    res.json({ question: q })
  } catch (err) {
    console.error('Launch error:', err)
    res.status(500).json({ error: 'Failed to launch question' })
  }
})

// Launch a question (mark active, deactivate others)
router.post('/:id/launch', requireRole('teacher'), async (req, res) => {
  try {
    const q = await Question.findById(req.params.id)
    if (!q) return res.status(404).json({ error: 'Question not found' })
    const room = await Room.findOne({ _id: q.room, teacher: req.user._id })
    if (!room) return res.status(403).json({ error: 'Not authorized' })

    await Question.updateMany({ room: q.room }, { $set: { isActive: false } })
    q.isActive = true
    q.launchedAt = new Date()
    q.closesAt = new Date(Date.now() + (q.timeLimit || 30) * 1000)
    await q.save()
    res.json({ question: q })
  } catch (err) {
    console.error('Launch error:', err)
    res.status(500).json({ error: 'Failed to launch question' })
  }
})

export default router
