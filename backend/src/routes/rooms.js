import express from 'express'
import Room from '../models/Room.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = express.Router()

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

router.use(authenticate)

// Teacher creates a room
router.post('/', requireRole('teacher'), async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Room name is required' })

    let code
    for (let i = 0; i < 5; i++) {
      code = generateCode()
      const existing = await Room.findOne({ code })
      if (!existing) break
    }

    const room = await Room.create({ code, name, teacher: req.user._id })
    res.json({ room })
  } catch (err) {
    console.error('Create room error:', err)
    res.status(500).json({ error: 'Failed to create room' })
  }
})

// Get all rooms for current teacher
router.get('/mine', requireRole('teacher'), async (req, res) => {
  try {
    const rooms = await Room.find({ teacher: req.user._id }).sort({ createdAt: -1 })
    res.json({ rooms })
  } catch (err) {
    console.error('List rooms error:', err)
    res.status(500).json({ error: 'Failed to fetch rooms' })
  }
})

// Get a room by id (teacher) or by code (student join)
router.get('/:idOrCode', async (req, res) => {
  try {
    const { idOrCode } = req.params
    const query = idOrCode.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrCode } : { code: idOrCode.toUpperCase() }
    const room = await Room.findOne(query).populate('teacher', 'name email')
    if (!room) return res.status(404).json({ error: 'Room not found' })

    // Authorization: teacher who owns it OR any authenticated user (for student join)
    const isOwner = room.teacher._id.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'student') {
      return res.status(403).json({ error: 'Not authorized' })
    }
    res.json({ room, isOwner })
  } catch (err) {
    console.error('Get room error:', err)
    res.status(500).json({ error: 'Failed to fetch room' })
  }
})

// Student joins a room by code
router.post('/join', requireRole('student'), async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ error: 'Room code is required' })
    const room = await Room.findOne({ code: code.toUpperCase() })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    if (!room.isActive) return res.status(400).json({ error: 'Room has ended' })

    if (!room.participants.some(p => p.toString() === req.user._id.toString())) {
      room.participants.push(req.user._id)
      await room.save()
    }
    res.json({ room })
  } catch (err) {
    console.error('Join room error:', err)
    res.status(500).json({ error: 'Failed to join room' })
  }
})

// End a room (teacher)
router.post('/:id/end', requireRole('teacher'), async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, teacher: req.user._id })
    if (!room) return res.status(404).json({ error: 'Room not found' })
    room.isActive = false
    room.endedAt = new Date()
    await room.save()
    res.json({ room })
  } catch (err) {
    console.error('End room error:', err)
    res.status(500).json({ error: 'Failed to end room' })
  }
})

export default router
