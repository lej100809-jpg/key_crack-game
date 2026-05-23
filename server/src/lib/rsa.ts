// Server-side RSA library (mirrors client, but answer included)

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

export interface ServerPuzzle {
  id: string
  n: number
  e: number
  c: number
  answer: number   // 복호화 정답 m — 클라이언트에 절대 노출 금지
  difficulty: Difficulty
  hints: {
    pHint?: number
    phiN?: number
    dCandidates?: number[]
  }
}

// ─── 정수론 ────────────────────────────────────────────────────────────────────

export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function primesUpTo(n: number): number[] {
  const sieve = new Uint8Array(n + 1).fill(1)
  sieve[0] = sieve[1] = 0
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = 0
  }
  const result: number[] = []
  for (let i = 2; i <= n; i++) if (sieve[i]) result.push(i)
  return result
}

export function gcd(a: number, b: number): number {
  while (b !== 0) ;[a, b] = [b, a % b]
  return a
}

function extGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x, y] = extGcd(b, a % b)
  return [g, y, x - Math.floor(a / b) * y]
}

export function eulerPhi(p: number, q: number): number {
  return (p - 1) * (q - 1)
}

export function modInverse(e: number, phi: number): number | null {
  const [g, x] = extGcd(e % phi, phi)
  if (g !== 1) return null
  return ((x % phi) + phi) % phi
}

export function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0
  let result = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp)
  const m = BigInt(mod)
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m
    b = (b * b) % m
    e >>= 1n
  }
  return Number(result)
}

export function factorize(n: number): [number, number] | null {
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0 && isPrime(i) && isPrime(n / i)) return [i, n / i]
  }
  return null
}

// ─── 퍼즐 생성 ────────────────────────────────────────────────────────────────

const PRIME_RANGES: Record<Difficulty, [number, number]> = {
  beginner: [2, 10],
  easy:     [2, 20],
  medium:   [2, 50],
  hard:     [2, 97],
  expert:   [2, 97],
}

const E_CANDIDATES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31]

function pickE(phi: number): number | null {
  const valid = E_CANDIDATES.filter(e => e < phi && gcd(e, phi) === 1)
  return valid.length ? valid[Math.floor(Math.random() * valid.length)] : null
}

function generateDCandidates(d: number, phi: number, count: number): number[] {
  const set = new Set<number>([d])
  let tries = 0
  while (set.size < count && tries++ < 5000) {
    const f = 2 + Math.floor(Math.random() * (phi - 2))
    if (f !== d) set.add(f)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

export function generateServerPuzzle(difficulty: Difficulty): ServerPuzzle {
  const [minP, maxP] = PRIME_RANGES[difficulty]
  const primes = primesUpTo(maxP).filter(p => p >= minP)
  if (primes.length < 2) throw new Error('Not enough primes')

  let p: number, q: number, phi: number, e: number | null, d: number | null
  let attempts = 0
  do {
    p = primes[Math.floor(Math.random() * primes.length)]
    q = primes[Math.floor(Math.random() * primes.length)]
    phi = eulerPhi(p, q)
    e = pickE(phi)
    d = e !== null ? modInverse(e, phi) : null
    if (++attempts > 500) throw new Error('RSA param generation failed')
  } while (p === q || e === null || d === null || d === 1)

  const n = p * q
  let m: number
  do { m = 2 + Math.floor(Math.random() * Math.min(n - 2, 99)) }
  while (gcd(m, n) !== 1)

  const c = modPow(m, e, n)

  const hints: ServerPuzzle['hints'] = {}
  if (difficulty === 'easy')    hints.pHint = p
  if (difficulty === 'beginner') hints.phiN  = phi
  // d 후보: beginner(3개), easy(5개), hard(5개), expert(3개)
  if (difficulty === 'beginner') hints.dCandidates = generateDCandidates(d, phi, 3)
  if (difficulty === 'easy')     hints.dCandidates = generateDCandidates(d, phi, 5)
  if (difficulty === 'medium')   hints.dCandidates = generateDCandidates(d, phi, 5)
  if (difficulty === 'hard')     hints.dCandidates = generateDCandidates(d, phi, 5)
  if (difficulty === 'expert')   hints.dCandidates = generateDCandidates(d, phi, 3)

  return {
    id: `${difficulty}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    n, e, c, answer: m, difficulty, hints,
  }
}

/** 단계별 서버 검증 */
export function verifyStep(
  step: 1 | 2 | 3 | 4,
  value: number,
  puzzle: ServerPuzzle,
  context?: { p?: number; q?: number; phiN?: number; d?: number },
): boolean {
  switch (step) {
    case 1: {
      const other = puzzle.n / value
      return Number.isInteger(other) && isPrime(value) && isPrime(other)
    }
    case 2: {
      const p = context?.p, q = context?.q
      if (!p || !q) return false
      return value === eulerPhi(p, q)
    }
    case 3: {
      const phi = context?.phiN
      if (!phi) return false
      return (BigInt(puzzle.e) * BigInt(value)) % BigInt(phi) === 1n
    }
    case 4:
      return value === puzzle.answer
    default:
      return false
  }
}
