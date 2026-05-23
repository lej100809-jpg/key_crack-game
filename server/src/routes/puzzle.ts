import { Router } from 'express'
import { generateServerPuzzle } from '../lib/rsa'
import type { Difficulty } from '../lib/rsa'

const router = Router()
const DIFFICULTIES: Difficulty[] = ['beginner','easy','medium','hard','expert']

/* GET /api/puzzle?difficulty=easy */
router.get('/', (req, res) => {
  const diff = (req.query.difficulty as Difficulty) ?? 'easy'
  if (!DIFFICULTIES.includes(diff)) {
    res.status(400).json({ error: 'Invalid difficulty' }); return
  }
  try {
    const puzzle = generateServerPuzzle(diff)
    const { answer: _omit, ...clientPuzzle } = puzzle   // answer 제외
    res.json(clientPuzzle)
  } catch (e) {
    res.status(500).json({ error: 'Puzzle generation failed' })
  }
})

/* POST /api/puzzle/verify */
router.post('/verify', (req, res) => {
  const { puzzleId: _pid, answer, expected } = req.body as { puzzleId: string; answer: number; expected: number }
  res.json({ correct: answer === expected })
})

export default router
