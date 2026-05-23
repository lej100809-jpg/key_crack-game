import { useState } from 'react'
import type { RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import { isPrime } from '@/lib/rsa'
import PrimeTable from '@/components/ui/PrimeTable'
import StepHelp from '@/components/ui/StepHelp'

interface Props {
  puzzle:    RSAPuzzle
  onSubmit:  (p: number, q: number) => 'correct' | 'wrong'
  completed: boolean
  locked:    boolean
  inputs:    { p: number | null; q: number | null }
}

const S = { color: 'var(--step1)' }

export default function StepFactorize({ puzzle, onSubmit, completed, locked, inputs }: Props) {
  const mode = DIFFICULTY_CONFIG[puzzle.difficulty].step1Mode
  const [pVal, setPVal] = useState(inputs.p?.toString() ?? '')
  const [qVal, setQVal] = useState(inputs.q?.toString() ?? '')
  const [err,  setErr]  = useState('')

  function handleSubmit() {
    const p = parseInt(pVal), q = parseInt(qVal)
    if (isNaN(p) || isNaN(q)) { setErr('두 값을 모두 입력하세요.'); return }
    const result = onSubmit(p, q)
    if (result === 'wrong') {
      const msg = !isPrime(p) || !isPrime(q)
        ? '두 값 모두 소수여야 합니다.'
        : `${p} × ${q} = ${p * q} ≠ ${puzzle.n}`
      setErr(msg)
    } else {
      setErr('')
    }
  }

  function handleTableSelect(val: number) {
    if (!pVal) { setPVal(String(val)); return }
    if (!qVal) { setQVal(String(val)); return }
    setPVal(String(val)); setQVal('')
  }

  const baseStyle = {
    padding: '1.25rem',
    background: locked ? 'rgba(255,255,255,0.01)' : 'var(--bg-card)',
    border: `1px solid ${completed ? 'rgba(99,102,241,0.4)' : locked ? 'var(--border)' : 'rgba(99,102,241,0.2)'}`,
    opacity: locked ? 0.45 : 1,
    transition: 'all 0.3s',
    position: 'relative' as const,
  }

  return (
    <div style={baseStyle}>
      {/* 왼쪽 컬러 바 */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '3px', height: '100%',
        background: completed ? 'var(--step1)' : locked ? 'var(--tx3)' : 'var(--step1)',
        opacity: locked ? 0.3 : 1,
      }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem',
            fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: locked ? 'var(--tx3)' : S.color,
            background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.12)',
            padding: '0.15rem 0.55rem', border: `1px solid ${locked ? 'var(--border)' : 'rgba(99,102,241,0.3)'}`,
          }}>
            STEP 01
          </span>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, color: locked ? 'var(--tx3)' : 'var(--tx)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            소인수분해
          </span>
          {!locked && !completed && (
            <StepHelp
              title="소인수분해" color="var(--step1)"
              formula="n = p × q  (p, q 는 소수)"
              items={[
                { label: 'n =', value: String(puzzle.n) },
                { label: '√n ≈', value: String(Math.ceil(Math.sqrt(puzzle.n))) + ' 까지 시도' },
                { label: '소수로 나눠보기', value: '2, 3, 5, 7, 11 ...' },
                { label: 'n ÷ p = q', value: '정수면 정답!' },
              ]}
              tip="소수 테이블에서 클릭하면 자동 입력됩니다."
            />
          )}
          {completed && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '1rem' }}>✓</span>}
          {locked && <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.7rem' }}>🔒 LOCKED</span>}
        </div>

        {/* 수식 표시 */}
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '1rem', color: 'var(--green)',
          background: 'rgba(0,255,136,0.05)', borderLeft: '2px solid var(--green)',
          padding: '0.4rem 0.75rem', marginBottom: '1rem', letterSpacing: '0.05em',
        }}>
          n = <strong style={{ color: 'var(--cyan)' }}>{puzzle.n}</strong> = p × q &nbsp;
          <span style={{ color: 'var(--tx3)', fontSize: '0.75rem' }}>(p, q는 소수)</span>
        </div>

        {/* 힌트 표시 (easy 모드) */}
        {mode === 'hint' && puzzle.hints.pHint && !completed && !locked && (
          <div style={{ fontSize: '0.72rem', color: 'var(--warn)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            💡 힌트: p = {puzzle.hints.pHint}
          </div>
        )}

        {/* 소수 테이블 — 모든 모드에서 표시 (난이도에 따라 max 조정) */}
        {!completed && !locked && (
          <div style={{ marginBottom: '1rem' }}>
            <PrimeTable
              max={
                puzzle.difficulty === 'beginner' ? 10 :
                puzzle.difficulty === 'easy'     ? 20 :
                puzzle.difficulty === 'medium'   ? 53 : 97
              }
              highlight={[parseInt(pVal), parseInt(qVal)].filter(v => !isNaN(v) && isPrime(v))}
              onSelect={handleTableSelect}   // 클릭하면 p/q 입력창에 자동 입력
            />
          </div>
        )}

        {/* 입력 영역 */}
        {!completed && !locked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--tx2)', fontSize: '0.85rem' }}>{puzzle.n} =</span>
            <StepInput
              value={pVal}
              onChange={v => { setPVal(v); setErr('') }}
              onEnter={handleSubmit}
              placeholder="p"
              color="var(--step1)"
            />
            <span style={{ color: 'var(--tx2)' }}>×</span>
            <StepInput
              value={qVal}
              onChange={v => { setQVal(v); setErr('') }}
              onEnter={handleSubmit}
              placeholder="q"
              color="var(--step1)"
            />
            <SubmitBtn onClick={handleSubmit} color="var(--step1)" />
          </div>
        )}

        {/* 정답 표시 */}
        {completed && inputs.p !== null && inputs.q !== null && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'var(--green)', letterSpacing: '0.05em' }}>
            {puzzle.n} = <strong>{inputs.p}</strong> × <strong>{inputs.q}</strong> ✓
          </div>
        )}

        {err && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--mag)' }}>⚠ {err}</div>}
      </div>
    </div>
  )
}

/* ── 재사용 미니 컴포넌트 ─────────────────────────────── */
function StepInput({ value, onChange, onEnter, placeholder, color }: {
  value: string; onChange: (v: string) => void; onEnter?: () => void
  placeholder: string; color: string
}) {
  return (
    <input
      type="number" min={2} value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder}
      style={{
        width: '5rem', padding: '0.4rem 0.6rem',
        background: 'var(--bg-input)', border: `1px solid ${color}`,
        color: 'var(--green)', fontFamily: 'JetBrains Mono', fontSize: '0.9rem',
        outline: 'none', textAlign: 'center',
      }}
    />
  )
}

function SubmitBtn({ onClick, color }: { onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.4rem 1.1rem',
        background: color, color: 'var(--bg)',
        border: 'none', fontFamily: 'Rajdhani, sans-serif',
        fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em',
        textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      제출
    </button>
  )
}
