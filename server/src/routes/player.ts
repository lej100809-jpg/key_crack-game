import { Router } from 'express'

const router = Router()

// 인메모리 플레이어 DB (Firebase 연동 전 임시)
const playerDB = new Map<string, {
  id: string; nickname: string; coins: number;
  badges: string[]; rating: number;
}>()

/* GET /api/player/:id */
router.get('/:id', (req, res) => {
  const p = playerDB.get(req.params.id)
  if (!p) { res.status(404).json({ error: 'Player not found' }); return }
  res.json(p)
})

/* POST /api/player (초기화/업서트) */
router.post('/', (req, res) => {
  const { id, nickname } = req.body as { id: string; nickname: string }
  if (!id || !nickname) { res.status(400).json({ error: 'id and nickname required' }); return }
  const existing = playerDB.get(id)
  const player = existing ?? { id, nickname, coins: 0, badges: [], rating: 1000 }
  playerDB.set(id, player)
  res.json(player)
})

/* POST /api/player/:id/reward */
router.post('/:id/reward', (req, res) => {
  const p = playerDB.get(req.params.id)
  if (!p) { res.status(404).json({ error: 'Player not found' }); return }
  const { coins = 0, badge } = req.body as { coins?: number; badge?: string }
  p.coins += coins
  if (badge && !p.badges.includes(badge)) p.badges.push(badge)
  res.json({ coins: p.coins, badge })
})

/* GET /api/leaderboard */
router.get('/leaderboard/battle', (_req, res) => {
  const sorted = [...playerDB.values()].sort((a,b) => b.rating - a.rating).slice(0, 20)
  res.json(sorted)
})

export default router
