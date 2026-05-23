import { useState } from 'react'
import type { RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import StepHelp from '@/components/ui/StepHelp'

interface Props {
  puzzle:    RSAPuzzle
  prevP:     number
  prevQ:     number
  onSubmit:  (phiN: number) => 'correct' | 'wrong'
  completed: boolean
  locked:    boolean
  answer:    number | null
}

export default function StepPhi({ puzzle, prevP, prevQ, onSubmit, completed, locked, answer }: Props) {
  const mode     = DIFFICULTY_CONFIG[puzzle.difficulty].step2Mode
  const autoValue = (prevP - 1) * (prevQ - 1)

  const [val,  setVal]  = useState(answer?.toString() ?? '')
  const [pm1,  setPm1]  = useState('')
  const [qm1,  setQm1]  = useState('')
  const [err,  setErr]  = useState('')

  function submit(n: number) {
    if (isNaN(n)) { setErr('값을 입력하세요.'); return }
    const result = onSubmit(n)
    if (result === 'wrong') setErr(`φ(n) = (${prevP}−1)×(${prevQ}−1) = ${autoValue}`)
    else setErr('')
  }

  const color = 'var(--step2)'

  const headerBadge = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <span style={{ fontFamily: 'Rajdhani', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: locked ? 'var(--tx3)' : color, background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(6,182,212,0.12)', padding: '0.15rem 0.55rem', border: `1px solid ${locked ? 'var(--border)' : 'rgba(6,182,212,0.3)'}` }}>
        STEP 02
      </span>
      <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, color: locked ? 'var(--tx3)' : 'var(--tx)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        오일러 피 함수
      </span>
      {!locked && !completed && (
        <StepHelp
          title="φ(n) 계산" color="var(--step2)"
          formula="φ(n) = (p−1) × (q−1)"
          items={[
            { label: 'p, q 대입', value: `(${prevP}−1) × (${prevQ}−1)` },
            { label: '= ', value: `${prevP-1} × ${prevQ-1}` },
            { label: '= ', value: String((prevP-1)*(prevQ-1)) },
          ]}
          tip="beginner 난이도는 값이 자동 제공됩니다. '다음 단계' 버튼을 누르세요."
        />
      )}
      {completed && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '1rem' }}>✓</span>}
      {locked    && <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.7rem' }}>🔒 LOCKED</span>}
    </div>
  )

  const formulaBox = (
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', color: 'var(--green)', background: 'rgba(0,255,136,0.05)', borderLeft: '2px solid var(--green)', padding: '0.4rem 0.75rem', marginBottom: '1rem' }}>
      φ(n) = (p−1) × (q−1)
    </div>
  )

  const submitBtn = (n: number) => (
    <button onClick={() => submit(n)} style={{ padding: '0.4rem 1.1rem', background: color, color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase' }}>
      제출
    </button>
  )

  const inputStyle: React.CSSProperties = { padding: '0.35rem 0.5rem', background: 'var(--bg-input)', border: `1px solid ${color}`, color: 'var(--green)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem', outline: 'none', textAlign: 'center' }

  return (
    <div style={{
      padding: '1.25rem',
      background: locked ? 'rgba(255,255,255,0.01)' : 'var(--bg-card)',
      border: `1px solid ${completed ? 'rgba(6,182,212,0.4)' : locked ? 'var(--border)' : 'rgba(6,182,212,0.2)'}`,
      opacity: locked ? 0.45 : 1, transition: 'all 0.3s', position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '3px', height: '100%', background: locked ? 'var(--tx3)' : color, opacity: locked ? 0.3 : 1 }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {headerBadge}
        {formulaBox}

        {/* ── AUTO 모드: 값 보여주고 "다음 단계" 버튼 ── */}
        {mode === 'auto' && !completed && !locked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: color, letterSpacing: '0.05em' }}>
              φ({puzzle.n}) = ({prevP}−1)×({prevQ}−1) = <strong style={{ color: 'var(--green)' }}>{autoValue}</strong>
            </div>
            <button
              onClick={() => submit(autoValue)}
              style={{ padding: '0.4rem 1.1rem', background: color, color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              다음 단계 ▶
            </button>
          </div>
        )}

        {/* ── FORMULA 모드 ── */}
        {mode === 'formula' && !completed && !locked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--tx2)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>φ({puzzle.n}) = (</span>
            <input
              type="number" value={pm1}
              onChange={e => { setPm1(e.target.value); setErr('') }}
              placeholder={String(prevP - 1)}
              style={{ ...inputStyle, width: '4.5rem' }}
            />
            <span style={{ color: 'var(--tx2)' }}>×</span>
            <input
              type="number" value={qm1}
              onChange={e => { setQm1(e.target.value); setErr('') }}
              placeholder={String(prevQ - 1)}
              style={{ ...inputStyle, width: '4.5rem' }}
            />
            <span style={{ color: 'var(--tx2)' }}>) =</span>
            <span style={{ color: pm1 && qm1 ? 'var(--cyan)' : 'var(--tx3)', fontFamily: 'JetBrains Mono', minWidth: '2.5rem' }}>
              {pm1 && qm1 ? parseInt(pm1) * parseInt(qm1) : '?'}
            </span>
            {submitBtn(parseInt(pm1) * parseInt(qm1))}
          </div>
        )}

        {/* ── FREE 모드 ── */}
        {mode === 'free' && !completed && !locked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--tx2)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>φ({puzzle.n}) =</span>
            <input
              type="number" value={val}
              onChange={e => { setVal(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && submit(parseInt(val))}
              placeholder="?"
              style={{ ...inputStyle, width: '7rem' }}
            />
            {submitBtn(parseInt(val))}
          </div>
        )}

        {/* 정답 표시 */}
        {completed && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'var(--green)' }}>
            φ({puzzle.n}) = ({prevP}−1)×({prevQ}−1) = <strong>{answer}</strong> ✓
          </div>
        )}

        {err && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--mag)' }}>⚠ {err}</div>}
      </div>
    </div>
  )
}
