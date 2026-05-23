import { generateServerPuzzle } from '../lib/rsa'
import type { Difficulty } from '../lib/rsa'

export type SkillType = 'fake_hint' | 'time_cut' | 'shield' | 'bonus_hint'

export interface PlayerSession {
  socketId: string
  nickname: string
  roomId:   string | null
  step:     1 | 2 | 3 | 4
  score:    number
  isReady:  boolean
  hasShield: boolean
  cooldowns: Record<SkillType, number>
}

export interface BattleRoom {
  id:           string
  players:      Map<string, PlayerSession>   // key = socketId
  status:       'waiting' | 'in_round' | 'round_end' | 'game_over'
  currentRound: number
  totalRounds:  number
  puzzle:       ReturnType<typeof generateServerPuzzle> | null
  roundTimer:   NodeJS.Timeout | null
  roundStartedAt: number
}

const ROUND_DIFFICULTIES: Difficulty[] = ['beginner','easy','medium','hard','expert']
const ROUND_TIME_LIMITS = [null, null, 180, 120, 90] // null = no limit (use 120s default)
const TOTAL_ROUNDS = 5

const rooms   = new Map<string, BattleRoom>()
const queue:  string[] = []          // waiting socketIds
const players = new Map<string, PlayerSession>()

/* ── 플레이어 관리 ──────────────────────────────────────── */
export function registerPlayer(socketId: string, nickname: string): PlayerSession {
  const p: PlayerSession = {
    socketId, nickname, roomId: null,
    step: 1, score: 0, isReady: false, hasShield: false,
    cooldowns: { fake_hint: 0, time_cut: 0, shield: 0, bonus_hint: 0 },
  }
  players.set(socketId, p)
  return p
}

export function removePlayer(socketId: string) {
  const p = players.get(socketId)
  if (p?.roomId) {
    const room = rooms.get(p.roomId)
    if (room) room.players.delete(socketId)
  }
  players.delete(socketId)
  const qi = queue.indexOf(socketId)
  if (qi !== -1) queue.splice(qi, 1)
}

export function getPlayer(socketId: string) { return players.get(socketId) }

/* ── 매치메이킹 ─────────────────────────────────────────── */
export function enqueue(socketId: string): BattleRoom | null {
  if (queue.includes(socketId)) return null
  queue.push(socketId)
  if (queue.length >= 2) {
    const [a, b] = [queue.shift()!, queue.shift()!]
    return createRoom(a, b)
  }
  return null
}

export function dequeue(socketId: string) {
  const i = queue.indexOf(socketId)
  if (i !== -1) queue.splice(i, 1)
}

/* ── 룸 생성 ────────────────────────────────────────────── */
function createRoom(sidA: string, sidB: string): BattleRoom {
  const id  = `room-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
  const pA  = players.get(sidA)!
  const pB  = players.get(sidB)!
  pA.roomId = pB.roomId = id
  pA.step   = pB.step   = 1
  pA.score  = pB.score  = 0
  pA.isReady = pB.isReady = false

  const room: BattleRoom = {
    id, status: 'waiting', currentRound: 0, totalRounds: TOTAL_ROUNDS,
    players: new Map([[sidA, pA], [sidB, pB]]),
    puzzle: null, roundTimer: null, roundStartedAt: 0,
  }
  rooms.set(id, room)
  return room
}

export function getRoom(id: string) { return rooms.get(id) }

/* ── 레디 처리 ──────────────────────────────────────────── */
export function setReady(socketId: string): { allReady: boolean; room: BattleRoom | null } {
  const p = players.get(socketId)
  if (!p?.roomId) return { allReady: false, room: null }
  p.isReady = true
  const room = rooms.get(p.roomId)!
  const allReady = [...room.players.values()].every(pl => pl.isReady)
  return { allReady, room }
}

/* ── 라운드 시작 ────────────────────────────────────────── */
export function startRound(room: BattleRoom): ReturnType<typeof generateServerPuzzle> {
  room.currentRound++
  room.status = 'in_round'
  const diff  = ROUND_DIFFICULTIES[room.currentRound - 1]
  const puzzle = generateServerPuzzle(diff)
  room.puzzle  = puzzle
  room.roundStartedAt = Date.now()

  // 플레이어 초기화
  room.players.forEach(p => { p.step = 1; p.isReady = false })

  return puzzle
}

/* ── 제출 처리 ──────────────────────────────────────────── */
export interface SubmitResult {
  correct:    boolean
  score:      number
  timeTaken:  number
  allDone:    boolean
}

export function handleSubmit(
  socketId: string,
  roomId: string,
  answer: number,
  timeTaken: number,
): SubmitResult {
  const room   = rooms.get(roomId)
  const player = players.get(socketId)
  if (!room || !player || !room.puzzle) return { correct: false, score: 0, timeTaken, allDone: false }

  const correct = answer === room.puzzle.answer

  let score = 0
  if (correct) {
    const roundLimit = ROUND_TIME_LIMITS[room.currentRound - 1] ?? 120
    const timeBonus  = Math.max(0, roundLimit - timeTaken)
    score = 100 + timeBonus * 2
    player.score += score
  }

  // 모두 제출했는지 확인
  const allDone = true  // 1v1이므로 한 명이 제출하면 라운드 종료 트리거
  room.status   = 'round_end'

  return { correct, score, timeTaken, allDone }
}

/* ── 스킬 처리 ──────────────────────────────────────────── */
export function applySkill(
  fromId: string,
  targetId: string,
  skill: SkillType,
): { blocked: boolean; effect: string } {
  const from   = players.get(fromId)
  const target = players.get(targetId)
  if (!from || !target) return { blocked: false, effect: 'no-op' }

  const COOLDOWNS: Record<SkillType, number> = {
    fake_hint: 60, time_cut: 45, shield: 90, bonus_hint: 120,
  }

  if (from.cooldowns[skill] > 0) return { blocked: false, effect: 'on-cooldown' }
  from.cooldowns[skill] = COOLDOWNS[skill]

  if (skill === 'shield') { from.hasShield = true; return { blocked: false, effect: 'shield-self' } }
  if (target.hasShield)   { target.hasShield = false; return { blocked: true, effect: 'blocked' } }

  return { blocked: false, effect: skill }
}

/* ── 최종 랭킹 ──────────────────────────────────────────── */
export function getFinalRanking(room: BattleRoom) {
  return [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      playerId:   p.socketId,
      nickname:   p.nickname,
      totalScore: p.score,
      rank:       i + 1,
    }))
}

export function closeRoom(roomId: string) {
  const room = rooms.get(roomId)
  if (room?.roundTimer) clearTimeout(room.roundTimer)
  rooms.delete(roomId)
}
