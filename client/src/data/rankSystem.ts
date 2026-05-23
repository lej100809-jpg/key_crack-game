import type { Difficulty } from '@/types'
import type { VaultGrade } from '@/types'

// ─── 랭킹 포인트 계산 ───────────────────────────────────────────────────────

/** 스테이지 클리어 점수 */
export function calcStageScore(p: {
  difficulty:   Difficulty
  timeLimitSec: number | null
  timeTaken:    number          // 실제 소요 시간(초)
  hintsUsed:    number
}): number {
  const BASE: Record<Difficulty, number> = {
    beginner: 100, easy: 220, medium: 380, hard: 560, expert: 800,
  }
  const base       = BASE[p.difficulty]
  const timeBonus  = p.timeLimitSec ? Math.max(0, p.timeLimitSec - p.timeTaken) * 3 : 0
  const hintPenalty = p.hintsUsed * 25
  return Math.max(10, base + timeBonus - hintPenalty)
}

/** 금고 클리어 점수 */
export function calcVaultScore(p: {
  grade:        VaultGrade
  timeLimitSec: number
  timeTaken:    number
}): number {
  const BASE: Record<VaultGrade, number> = {
    bronze: 300, silver: 650, gold: 1100, platinum: 2200,
  }
  const timeBonus = Math.max(0, p.timeLimitSec - p.timeTaken) * 5
  return BASE[p.grade] + timeBonus
}

/** 배틀 라운드 점수 */
export function calcBattleRoundScore(p: {
  correct:      boolean
  timeTaken:    number
  roundNum:     number   // 1~5 (높을수록 보너스)
}): number {
  if (!p.correct) return 0
  const roundBonus = p.roundNum * 50
  const timeBonus  = Math.max(0, 180 - p.timeTaken) * 2
  return 100 + roundBonus + timeBonus
}

/** 배틀 승리 보너스 */
export const BATTLE_WIN_BONUS = 300

// ─── 티어 정의 ──────────────────────────────────────────────────────────────

export interface RankTier {
  id:       string
  name:     string
  minRP:    number     // 최소 RP
  maxRP:    number     // -1 = 무한
  color:    string
  glow:     string
  icon:     string     // PixelIcon name
  desc:     string
}

export const RANK_TIERS: RankTier[] = [
  { id:'rookie',    name:'ROOKIE',    minRP:0,      maxRP:499,   color:'#778899', glow:'rgba(119,136,153,0.4)', icon:'user',   desc:'RSA의 세계에 첫발을 내딛은 신참 요원' },
  { id:'agent',     name:'AGENT',     minRP:500,    maxRP:1499,  color:'#06b6d4', glow:'rgba(6,182,212,0.4)',   icon:'key',    desc:'기본 암호 해독 능력을 갖춘 현장 요원' },
  { id:'operative', name:'OPERATIVE', minRP:1500,   maxRP:3999,  color:'#00ff88', glow:'rgba(0,255,136,0.4)',   icon:'shield', desc:'중급 소수 범위를 능숙하게 처리하는 전문가' },
  { id:'specialist',name:'SPECIALIST',minRP:4000,   maxRP:7999,  color:'#ffd700', glow:'rgba(255,215,0,0.4)',   icon:'star',   desc:'시간 압박 속에서도 냉철하게 해독하는 전문가' },
  { id:'cipher',    name:'CIPHER',    minRP:8000,   maxRP:14999, color:'#ff9900', glow:'rgba(255,153,0,0.4)',   icon:'lock',   desc:'고급 RSA 파라미터를 자유자재로 다루는 요원' },
  { id:'elite',     name:'ELITE',     minRP:15000,  maxRP:24999, color:'#ff5544', glow:'rgba(255,85,68,0.4)',   icon:'crossed_swords', desc:'최고 난이도도 거뜬히 해내는 엘리트 해커' },
  { id:'shadow',    name:'SHADOW',    minRP:25000,  maxRP:39999, color:'#aa44ff', glow:'rgba(170,68,255,0.4)',  icon:'bolt',   desc:'흔적 없이 암호를 뚫는 그림자 같은 존재' },
  { id:'phantom',   name:'PHANTOM',   minRP:40000,  maxRP:59999, color:'#ff44aa', glow:'rgba(255,68,170,0.4)',  icon:'diamond','desc':'배틀 & 볼트를 완벽히 지배하는 팬텀 에이전트' },
  { id:'legend',    name:'LEGEND',    minRP:60000,  maxRP:89999, color:'#ffd700', glow:'rgba(255,215,0,0.6)',   icon:'medal',  desc:'전설로 기록될 최상위 암호 해독사' },
  { id:'master',    name:'MASTER',    minRP:90000,  maxRP:-1,    color:'#e8e6ff', glow:'rgba(232,230,255,0.7)', icon:'star',   desc:'RSA 마스터 — 이 경지에 이른 자는 극소수' },
]

export function getTier(rp: number): RankTier {
  return [...RANK_TIERS].reverse().find(t => rp >= t.minRP) ?? RANK_TIERS[0]
}

export function getNextTier(rp: number): RankTier | null {
  const cur = getTier(rp)
  const idx = RANK_TIERS.findIndex(t => t.id === cur.id)
  return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null
}

/** 현재 티어 내 진행률 (0~1) */
export function tierProgress(rp: number): number {
  const cur  = getTier(rp)
  const next = getNextTier(rp)
  if (!next) return 1
  const span = next.minRP - cur.minRP
  return Math.min(1, (rp - cur.minRP) / span)
}

// ─── 점수 기록 타입 ──────────────────────────────────────────────────────────

export type ScoreSource = 'stage' | 'vault' | 'battle_win' | 'battle_round'

export interface ScoreRecord {
  id:     string
  source: ScoreSource
  label:  string       // "Stage 7 · Hard", "Gold Vault" 등
  rp:     number
  ts:     number       // Date.now()
}
