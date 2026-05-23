import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import puzzleRouter from './routes/puzzle'
import playerRouter from './routes/player'
import { registerBattleHandlers } from './socket/battleHandler'

const app        = express()
const httpServer = createServer(app)
const io         = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:4173'], methods: ['GET','POST'] },
})

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

/* API 라우트 */
app.use('/api/puzzle', puzzleRouter)
app.use('/api/player', playerRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

/* Socket.io */
io.on('connection', socket => {
  console.log(`[ws] + ${socket.id}`)
  registerBattleHandlers(io, socket)
})

const PORT = process.env.PORT ?? 4000
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════╗
║   KEY CRACK SERVER  :${PORT}    ║
║   /api/puzzle  /api/player   ║
║   Socket.io battle ready     ║
╚══════════════════════════════╝`)
})
