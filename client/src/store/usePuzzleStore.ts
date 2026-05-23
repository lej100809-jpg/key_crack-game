import { create } from 'zustand'
import type { Difficulty, RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import type { PuzzleSolution } from '@/lib/puzzleGenerator'
import { createPuzzle } from '@/lib/puzzleGenerator'
import {
  validateFactorize,
  validatePhi,
  validatePrivateKey,
  validateDecrypt,
} from '@/lib/rsa'

// ─── 타입 ──────────────────────────────────────────────────────────────────────

export interface PuzzleInputs {
  p:    number | null
  q:    number | null
  phiN: number | null
  d:    number | null
  m:    number | null
}

export type SubmitResult = 'correct' | 'wrong'
export type PuzzleStatus = 'idle' | 'solving' | 'success' | 'failed'

interface PuzzleState {
  puzzle:       RSAPuzzle | null
  _solution:    PuzzleSolution | null
  currentStep:  1 | 2 | 3 | 4
  inputs:       PuzzleInputs
  hintsUsed:    number
  bonusHints:   number       // 인벤토리 힌트로 추가된 횟수
  timeBonus:    number       // 시간 연장권으로 추가된 초
  startedAt:    number
  status:       PuzzleStatus
  penaltyTotal: number
  wrongFlash:   boolean
  reviveUsed:   boolean      // 부활권 이미 사용했는지
}

interface PuzzleActions {
  /** 퍼즐 로드 (새 문제 생성) */
  loadPuzzle: (difficulty: Difficulty) => void

  /**
   * Step 1 전용: 소인수분해 제출
   * p, q 두 값을 동시에 받아 p×q===n && isPrime 검증
   */
  submitFactorize: (p: number, q: number) => SubmitResult

  /**
   * Step 2~4 단일값 제출
   * step 2 → φ(n), step 3 → d, step 4 → m
   */
  submitStep: (step: 2 | 3 | 4, value: number) => SubmitResult

  /** 힌트 사용 (남은 횟수 소비). 성공하면 true */
  useHint: (step: 1 | 2 | 3 | 4) => boolean

  /** 배틀 모드 방해 스킬 — 타이머 패널티 */
  applyTimePenalty: (sec: number) => void

  /** 인벤토리 힌트 추가 (소모품 사용) */
  addBonusHint: () => void

  /** 시간 연장 (소모품 사용) */
  applyTimeBonus: (sec: number) => void

  /** 부활권 사용 — failed 상태를 solving으로 되돌리고 타이머 절반 리셋 */
  revive: (totalSec: number) => boolean

  /** 퍼즐 초기화 (다시 풀기) */
  resetPuzzle: () => void

  /** 오답 애니메이션 플래그 초기화 */
  clearWrongFlash: () => void
}

// ─── 초기값 ────────────────────────────────────────────────────────────────────

const INIT_INPUTS: PuzzleInputs = { p: null, q: null, phiN: null, d: null, m: null }

const INIT_STATE: PuzzleState = {
  puzzle:       null,
  _solution:    null,
  currentStep:  1,
  inputs:       INIT_INPUTS,
  hintsUsed:    0,
  bonusHints:   0,
  timeBonus:    0,
  startedAt:    0,
  status:       'idle',
  penaltyTotal: 0,
  wrongFlash:   false,
  reviveUsed:   false,
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const usePuzzleStore = create<PuzzleState & PuzzleActions>()((set, get) => ({
  ...INIT_STATE,

  // ── loadPuzzle ────────────────────────────────────────────────────────────
  loadPuzzle: (difficulty) => {
    const { puzzle, solution } = createPuzzle(difficulty)
    set({
      puzzle,
      _solution:    solution,
      currentStep:  1,
      inputs:       INIT_INPUTS,
      hintsUsed:    0,
      bonusHints:   0,
      timeBonus:    0,
      startedAt:    Date.now(),
      status:       'solving',
      penaltyTotal: 0,
      reviveUsed:   false,
      wrongFlash:   false,
    })
  },

  // ── submitFactorize (Step 1) ──────────────────────────────────────────────
  submitFactorize: (p, q) => {
    const { puzzle, _solution } = get()
    if (!puzzle || !_solution) return 'wrong'

    const result = validateFactorize(p, q, puzzle)
    if (!result.correct) {
      set({ wrongFlash: true })
      return 'wrong'
    }

    // p, q 순서 정규화 (작은 게 p)
    const [sp, sq] = p <= q ? [p, q] : [q, p]
    set({
      inputs:      { ...get().inputs, p: sp, q: sq },
      currentStep: 2,
      wrongFlash:  false,
    })
    return 'correct'
  },

  // ── submitStep (Step 2~4) ─────────────────────────────────────────────────
  submitStep: (step, value) => {
    const { puzzle, inputs, _solution } = get()
    if (!puzzle || !_solution) return 'wrong'

    let result: ReturnType<typeof validatePhi>

    if (step === 2) {
      if (inputs.p === null || inputs.q === null) return 'wrong'
      result = validatePhi(value, inputs.p, inputs.q)
      if (result.correct) {
        set({ inputs: { ...inputs, phiN: value }, currentStep: 3, wrongFlash: false })
      }
    } else if (step === 3) {
      if (inputs.phiN === null) return 'wrong'
      result = validatePrivateKey(value, puzzle, inputs.phiN)
      if (result.correct) {
        set({ inputs: { ...inputs, d: value }, currentStep: 4, wrongFlash: false })
      }
    } else {
      // step === 4
      if (inputs.d === null) return 'wrong'
      result = validateDecrypt(value, puzzle, inputs.d)
      if (result.correct) {
        set({
          inputs:  { ...inputs, m: value },
          status:  'success',
          wrongFlash: false,
        })
      }
    }

    if (!result.correct) {
      // 패널티 기록 (TimerBar가 읽어서 차감)
      const penaltySec = DIFFICULTY_CONFIG[puzzle.difficulty].wrongPenaltySec
      set(s => ({
        wrongFlash:   true,
        penaltyTotal: s.penaltyTotal + penaltySec,
      }))
      return 'wrong'
    }

    return 'correct'
  },

  // ── useHint ───────────────────────────────────────────────────────────────
  useHint: (_step) => {
    const { puzzle, hintsUsed, bonusHints } = get()
    if (!puzzle) return false
    const maxHints = DIFFICULTY_CONFIG[puzzle.difficulty].hintCount + bonusHints
    if (hintsUsed >= maxHints) return false
    set(s => ({ hintsUsed: s.hintsUsed + 1 }))
    return true
  },

  // ── applyTimePenalty ──────────────────────────────────────────────────────
  applyTimePenalty: (sec) => {
    set(s => ({ penaltyTotal: s.penaltyTotal + sec }))
  },

  // ── addBonusHint ──────────────────────────────────────────────────────────
  addBonusHint: () => {
    set(s => ({ bonusHints: s.bonusHints + 1 }))
  },

  // ── applyTimeBonus ────────────────────────────────────────────────────────
  applyTimeBonus: (sec) => {
    set(s => ({ timeBonus: s.timeBonus + sec }))
  },

  // ── revive ────────────────────────────────────────────────────────────────
  revive: (totalSec) => {
    const { status, reviveUsed } = get()
    if (status !== 'failed' || reviveUsed) return false
    set({
      status:       'solving',
      reviveUsed:   true,
      // 타이머를 절반으로 리셋: penaltyTotal을 크게 늘려 남은시간 = totalSec/2 로 맞춤
      startedAt:    Date.now(),
      penaltyTotal: 0,
      timeBonus:    Math.floor(totalSec / 2),
    })
    return true
  },

  // ── resetPuzzle ───────────────────────────────────────────────────────────
  resetPuzzle: () => set(INIT_STATE),

  // ── clearWrongFlash ───────────────────────────────────────────────────────
  clearWrongFlash: () => set({ wrongFlash: false }),
}))

// ─── 셀렉터 헬퍼 ───────────────────────────────────────────────────────────────

/** 현재 경과 시간(초) 계산 셀렉터 */
export function selectElapsedSec(state: PuzzleState): number {
  if (state.startedAt === 0) return 0
  return Math.floor((Date.now() - state.startedAt) / 1000) + state.penaltyTotal
}

/** 남은 힌트 수 */
export function selectRemainingHints(state: PuzzleState): number {
  if (!state.puzzle) return 0
  return Math.max(0, DIFFICULTY_CONFIG[state.puzzle.difficulty].hintCount - state.hintsUsed)
}
