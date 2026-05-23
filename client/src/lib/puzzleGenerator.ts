import type { Difficulty, RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import type { PuzzleSolution } from './rsa'
import { generatePuzzle, primesUpTo, gcd, eulerPhi, modInverse, modPow, generateDCandidates } from './rsa'

export type { PuzzleSolution }

export interface GeneratedPuzzle {
  puzzle: RSAPuzzle
  solution: PuzzleSolution
}

/** 난이도별 퍼즐 생성. 실패 시 최대 10회 재시도 */
export function createPuzzle(difficulty: Difficulty): GeneratedPuzzle {
  for (let i = 0; i < 10; i++) {
    try {
      return generatePuzzle(difficulty)
    } catch {
      // 재시도
    }
  }
  throw new Error(`[puzzleGenerator] ${difficulty} 퍼즐 생성 실패`)
}

/**
 * 스테이지 전용 퍼즐: difficulty 설정을 따르되 primeRange만 스테이지 값으로 덮어씀
 */
export function createStagePuzzle(
  difficulty: Difficulty,
  primeRange: [number, number],
): GeneratedPuzzle {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  const [minP, maxP] = primeRange
  const primes = primesUpTo(maxP).filter(p => p >= minP)

  if (primes.length < 2) throw new Error('Not enough primes in stage range')

  const E_CANDIDATES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]

  let p: number, q: number, phi: number, e: number | null, d: number | null
  let attempts = 0
  do {
    p = primes[Math.floor(Math.random() * primes.length)]
    q = primes[Math.floor(Math.random() * primes.length)]
    phi = eulerPhi(p, q)
    const valid = E_CANDIDATES.filter(ev => ev < phi && gcd(ev, phi) === 1)
    e = valid.length ? valid[Math.floor(Math.random() * valid.length)] : null
    d = e !== null ? modInverse(e, phi) : null
    if (++attempts > 500) throw new Error('Param gen failed')
  } while (p === q || e === null || d === null || d === 1)

  const n = p * q
  let m: number
  do { m = 2 + Math.floor(Math.random() * Math.min(n - 2, 99)) }
  while (gcd(m, n) !== 1)

  const c = modPow(m, e, n)

  const hints: RSAPuzzle['hints'] = {}
  if (cfg.step1Mode === 'hint') hints.pHint = p
  if (cfg.step2Mode === 'auto') hints.phiN = phi
  if (cfg.step3Mode === 'choice3') hints.dCandidates = generateDCandidates(d, phi, 3)
  else if (cfg.step3Mode === 'choice5') hints.dCandidates = generateDCandidates(d, phi, 5)

  const puzzle: RSAPuzzle = {
    id: `stage-${difficulty}-${Date.now()}`,
    n, e, c, difficulty, hints,
  }
  const solution: PuzzleSolution = { p, q, phiN: phi, d, m }

  return { puzzle, solution }
}
