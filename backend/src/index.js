import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

import authRoutes from './routes/auth.js'
import roomRoutes from './routes/rooms.js'
import questionRoutes from './routes/questions.js'
import responseRoutes from './routes/responses.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }
})

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, version: '1.0.0' }))

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/responses', responseRoutes)

// ---------- Socket.IO ----------
// Track room presence: Map<roomCode, Set<socketId>>
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token'))
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = payload.userId
    socket.role = payload.role
    next()
  } catch (e) {
    next(new Error('Invalid token'))
  }
})

const roomParticipants = new Map() // code -> Set<{socketId, userId, name}>

io.on('connection', (socket) => {
  console.log(`[socket] connect ${socket.id} user=${socket.userId} role=${socket.role}`)

  // Join a room (students joining by code, teachers for their own room)
  socket.on('room:join', ({ roomCode, name }) => {
    if (!roomCode) return
    roomCode = roomCode.toUpperCase()
    socket.join(roomCode)
    if (!roomParticipants.has(roomCode)) roomParticipants.set(roomCode, new Map())
    roomParticipants.get(roomCode).set(socket.id, { socketId: socket.id, userId: socket.userId, name })

    // Notify room of new participant
    io.to(roomCode).emit('room:participant-joined', {
      userId: socket.userId,
      name,
      totalParticipants: roomParticipants.get(roomCode).size
    })
    console.log(`[socket] ${name} joined ${roomCode} (${roomParticipants.get(roomCode).size} total)`)
  })

  socket.on('room:leave', ({ roomCode }) => {
    if (!roomCode) return
    roomCode = roomCode.toUpperCase()
    socket.leave(roomCode)
    const set = roomParticipants.get(roomCode)
    if (set) {
      set.delete(socket.id)
      io.to(roomCode).emit('room:participant-left', {
        userId: socket.userId,
        totalParticipants: set.size
      })
    }
  })

  // Teacher launches a question
  socket.on('question:launch', ({ roomCode, question }) => {
    if (!roomCode || !question) return
    roomCode = roomCode.toUpperCase()
    console.log(`[socket] question launched in ${roomCode}: ${question._id}`)
    io.to(roomCode).emit('question:launched', question)
  })

  // Teacher closes a question
  socket.on('question:close', ({ roomCode, questionId }) => {
    if (!roomCode || !questionId) return
    roomCode = roomCode.toUpperCase()
    io.to(roomCode).emit('question:closed', { questionId })
  })

  // Live result updates
  socket.on('response:new', ({ roomCode, questionId, results, total }) => {
    if (!roomCode) return
    roomCode = roomCode.toUpperCase()
    socket.to(roomCode).emit('response:update', { questionId, results, total })
  })

  socket.on('disconnect', () => {
    for (const [code, set] of roomParticipants.entries()) {
      if (set.has(socket.id)) {
        const participant = set.get(socket.id)
        set.delete(socket.id)
        io.to(code).emit('room:participant-left', {
          userId: participant?.userId,
          totalParticipants: set.size
        })
      }
    }
    console.log(`[socket] disconnect ${socket.id}`)
  })
})

// Make io accessible to routes if needed
app.set('io', io)

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(PORT, () => console.log(`Spandan backend listening on :${PORT}`))
  })
  .catch((err) => {
    console.error('Mongo connection failed:', err)
    process.exit(1)
  })
