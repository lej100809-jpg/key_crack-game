import type { Difficulty, RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'

// ─── 기본 정수론 함수 ──────────────────────────────────────────────────────────

/** n이 소수인지 판별 (trial division) */
export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

/** n 이하의 소수 배열 반환 (에라토스테네스의 체) */
export function primesUpTo(n: number): number[] {
  const sieve = new Uint8Array(n + 1).fill(1)
  sieve[0] = sieve[1] = 0
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) sieve[j] = 0
    }
  }
  const result: number[] = []
  for (let i = 2; i <= n; i++) {
    if (sieve[i]) result.push(i)
  }
  return result
}

/** 최대공약수 (유클리드 호제법) */
export function gcd(a: number, b: number): number {
  while (b !== 0) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/** 확장 유클리드 알고리즘 → [gcd, x, y] (ax + by = gcd) */
function extGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x, y] = extGcd(b, a % b)
  return [g, y, x - Math.floor(a / b) * y]
}

/** 오일러 피 함수: φ(n) = (p-1)(q-1) */
export function eulerPhi(p: number, q: number): number {
  return (p - 1) * (q - 1)
}

/**
 * 모듈러 역원: e*d ≡ 1 (mod phi) 인 d 반환
 * gcd(e, phi) !== 1 이면 null
 */
export function modInverse(e: number, phi: number): number | null {
  const [g, x] = extGcd(e % phi, phi)
  if (g !== 1) return null
  return ((x % phi) + phi) % phi
}

/**
 * 빠른 모듈러 거듭제곱: base^exp mod mod
 * BigInt 사용으로 오버플로우 방지
 */
export function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0
  let result = 1n
  let b = BigInt(base) % BigInt(mod)
  let e = BigInt(exp)
  const m = BigInt(mod)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m
    b = (b * b) % m
    e >>= 1n
  }
  return Number(result)
}

/**
 * n을 두 소수의 곱으로 인수분해 → [p, q]
 * p ≤ q 순서 보장. 실패 시 null
 */
export function factorize(n: number): [number, number] | null {
  if (n < 4) return null
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      const j = n / i
      if (isPrime(i) && isPrime(j)) return [i, j]
    }
  }
  return null
}

// ─── 퍼즐 생성 헬퍼 ────────────────────────────────────────────────────────────

/** 범위 내 정수 랜덤 반환 (inclusive) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 후보 공개키 e 목록 (phi와 서로소인 것만) */
const E_CANDIDATES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]

/** phi와 서로소인 e 선택 (외부에서도 사용 가능) */
export function pickEFromPhi(phi: number): number | null {
  const valid = E_CANDIDATES.filter(e => e < phi && gcd(e, phi) === 1)
  if (valid.length === 0) return null
  return valid[randInt(0, valid.length - 1)]
}

function pickE(phi: number): number | null {
  return pickEFromPhi(phi)
}

/** d 후보 배열: 정답 1개 + 오답 (count-1)개, 셔플 후 반환 */
export function generateDCandidates(d: number, phi: number, count: number): number[] {
  const set = new Set<number>([d])
  let attempts = 0
  while (set.size < count && attempts < 5000) {
    attempts++
    const fake = randInt(2, phi - 1)
    // 실제 d가 아니고, e*fake ≡ 1 (mod phi)도 아닌 것만
    if (fake !== d) set.add(fake)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

// ─── 풀이 정답 타입 (클라이언트 내부용, 외부 노출 금지) ──────────────────────

export interface PuzzleSolution {
  p: number
  q: number
  phiN: number
  d: number
  m: number // 원본 메시지
}

// ─── 퍼즐 생성 ────────────────────────────────────────────────────────────────

/**
 * 난이도에 맞는 RSA 퍼즐 + 정답(solution) 생성
 * solution은 Zustand store 내부에만 보관, 컴포넌트에 직접 전달 금지
 */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: RSAPuzzle
  solution: PuzzleSolution
} {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  const [minP, maxP] = cfg.primeRange
  const primes = primesUpTo(maxP).filter(p => p >= minP)

  if (primes.length < 2) throw new Error(`Not enough primes in range [${minP}, ${maxP}]`)

  let p: number, q: number, n: number, phi: number, e: number | null, d: number | null

  // p ≠ q 조합이 나올 때까지 재시도
  let attempts = 0
  do {
    p = primes[randInt(0, primes.length - 1)]
    q = primes[randInt(0, primes.length - 1)]
    n = p * q
    phi = eulerPhi(p, q)
    e = pickE(phi)
    d = e !== null ? modInverse(e, phi) : null
    attempts++
    if (attempts > 500) throw new Error('Failed to generate valid RSA params')
  } while (p === q || e === null || d === null || d === 1)

  // 메시지 m: 2 ≤ m < n, gcd(m, n) = 1 인 임의 정수
  let m: number
  do {
    m = randInt(2, Math.min(n - 1, 100))
  } while (gcd(m, n) !== 1)

  const c = modPow(m, e, n)

  // 힌트 구성
  const hints: RSAPuzzle['hints'] = {}

  if (cfg.step1Mode === 'hint') {
    hints.pHint = p  // p의 값 힌트
  }
  if (cfg.step2Mode === 'auto') {
    hints.phiN = phi
  }
  if (cfg.step3Mode === 'choice3') {
    hints.dCandidates = generateDCandidates(d, phi, 3)
  } else if (cfg.step3Mode === 'choice5') {
    hints.dCandidates = generateDCandidates(d, phi, 5)
  }

  const puzzle: RSAPuzzle = {
    id: `${difficulty}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    n,
    e,
    c,
    difficulty,
    hints,
  }

  const solution: PuzzleSolution = { p, q, phiN: phi, d, m }

  return { puzzle, solution }
}

// ─── 단계별 정답 검증 ──────────────────────────────────────────────────────────

export interface ValidationResult {
  correct: boolean
  message?: string
}

/**
 * Step 1 — 소인수분해 검증
 * input: { p, q }
 */
export function validateFactorize(
  p: number,
  q: number,
  puzzle: RSAPuzzle,
): ValidationResult {
  if (!isPrime(p) || !isPrime(q)) return { correct: false, message: '두 값 모두 소수여야 합니다.' }
  if (p * q !== puzzle.n) return { correct: false, message: `${p} × ${q} ≠ ${puzzle.n}` }
  return { correct: true }
}

/**
 * Step 2 — φ(n) 검증
 * input: phiN
 * prevP, prevQ: Step 1 정답
 */
export function validatePhi(
  phiN: number,
  prevP: number,
  prevQ: number,
): ValidationResult {
  const expected = eulerPhi(prevP, prevQ)
  if (phiN !== expected) return { correct: false, message: `φ(n) = (${prevP}-1)×(${prevQ}-1) = ${expected}` }
  return { correct: true }
}

/**
 * Step 3 — 개인키 d 검증
 * e × d ≡ 1 (mod phiN)
 */
export function validatePrivateKey(
  d: number,
  puzzle: RSAPuzzle,
  phiN: number,
): ValidationResult {
  if ((BigInt(puzzle.e) * BigInt(d)) % BigInt(phiN) !== 1n) {
    return { correct: false, message: `${puzzle.e} × ${d} mod ${phiN} ≠ 1` }
  }
  return { correct: true }
}

/**
 * Step 4 — 복호화 검증
 * m = c^d mod n
 */
export function validateDecrypt(
  m: number,
  puzzle: RSAPuzzle,
  d: number,
): ValidationResult {
  const expected = modPow(puzzle.c, d, puzzle.n)
  if (m !== expected) return { correct: false, message: `c^d mod n = ${expected}` }
  return { correct: true }
}
