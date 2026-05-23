import { useState } from 'react'
import type { RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'

interface Props {
  puzzle:      RSAPuzzle
  hintsUsed:   number
  onUseHint:   (step: 1 | 2 | 3 | 4) => boolean
  currentStep: 1 | 2 | 3 | 4
}

const HINT_TEXT: Record<1 | 2 | 3 | 4, (puzzle: RSAPuzzle) => string> = {
  1: (p) => p.hints.pHint
    ? `힌트: p = ${p.hints.pHint}  →  q = ${p.n} ÷ ${p.hints.pHint} 를 계산해보세요`
    : `힌트: n = ${p.n} 을 두 소수의 곱으로 나눠보세요`,
  2: () => `힌트: φ(n) = (p−1) × (q−1) 공식을 사용하세요`,
  3: (p) => `힌트: e = ${p.e} 일 때, e×d mod φ(n) = 1 인 d를 구하세요`,
  4: (p) => `힌트: 계산기에서  ${p.c}  pow  d  mod  ${p.n}  순서로 입력하세요`,
}

export default function HintPanel({ puzzle, hintsUsed, onUseHint, currentStep }: Props) {
  const maxHints  = DIFFICULTY_CONFIG[puzzle.difficulty].hintCount
  const remaining = Math.max(0, maxHints - hintsUsed)
  const [revealed, setRevealed] = useState<Partial<Record<1 | 2 | 3 | 4, string>>>({})

  function handleHint(step: 1 | 2 | 3 | 4) {
    if (revealed[step]) return
    const ok = onUseHint(step)
    if (ok) setRevealed(prev => ({ ...prev, [step]: HINT_TEXT[step](puzzle) }))
  }

  if (maxHints === 0) return null

  return (
    <div className="hud" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span className="panel-tag" style={{ marginBottom: 0 }}>힌트</span>
        <span style={{ fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, color: remaining > 0 ? 'var(--green)' : 'var(--tx3)' }}>
          {remaining} / {maxHints === 99 ? '∞' : maxHints}
        </span>
      </div>

      {!revealed[currentStep] && (
        <button
          onClick={() => handleHint(currentStep)}
          disabled={remaining === 0}
          style={{
            width: '100%', padding: '0.5rem',
            background: remaining > 0 ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${remaining > 0 ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
            color: remaining > 0 ? 'var(--green)' : 'var(--tx3)',
            fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
            cursor: remaining > 0 ? 'pointer' : 'not-allowed',
            letterSpacing: '0.1em', transition: 'all 0.2s',
          }}
        >
          💡 STEP {currentStep} 힌트 보기
        </button>
      )}

      {([1, 2, 3, 4] as const).map(s => revealed[s] && (
        <div key={s} style={{
          marginTop: '0.5rem', padding: '0.5rem 0.75rem',
          background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.15)',
          borderLeft: '2px solid var(--green)', fontSize: '0.72rem', color: 'var(--green)', lineHeight: 1.6,
        }}>
          <span style={{ color: 'var(--tx3)', fontSize: '0.62rem' }}>STEP {s} › </span>
          {revealed[s]}
        </div>
      ))}
    </div>
  )
}
