import { useState } from 'react'
import type { RSAPuzzle } from '@/types'
import Calculator from '@/components/ui/Calculator'
import StepHelp from '@/components/ui/StepHelp'

interface Props {
  puzzle:    RSAPuzzle
  d:         number
  onSubmit:  (m: number) => 'correct' | 'wrong'
  completed: boolean
  locked:    boolean
  answer:    number | null
}

export default function StepDecrypt({ puzzle, d, onSubmit, completed, locked, answer }: Props) {
  const [val,      setVal]      = useState(answer?.toString() ?? '')
  const [err,      setErr]      = useState('')
  const [showCalc, setShowCalc] = useState(false)

  function handleSubmit() {
    const m = parseInt(val)
    if (isNaN(m)) { setErr('값을 입력하세요.'); return }
    const result = onSubmit(m)
    if (result === 'wrong') setErr(`c^d mod n = ${puzzle.c}^${d} mod ${puzzle.n} ≠ ${m}`)
    else setErr('')
  }

  const color = 'var(--step4)'

  return (
    <div style={{
      padding: '1.25rem',
      background: locked ? 'rgba(255,255,255,0.01)' : 'var(--bg-card)',
      border: `1px solid ${completed ? 'rgba(16,185,129,0.5)' : locked ? 'var(--border)' : 'rgba(16,185,129,0.25)'}`,
      opacity: locked ? 0.45 : 1, transition: 'all 0.3s', position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '3px', height: '100%', background: locked ? 'var(--tx3)' : color, opacity: locked ? 0.3 : 1 }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: locked ? 'var(--tx3)' : color, background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(16,185,129,0.12)', padding: '0.15rem 0.55rem', border: `1px solid ${locked ? 'var(--border)' : 'rgba(16,185,129,0.3)'}` }}>
            STEP 04
          </span>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, color: locked ? 'var(--tx3)' : 'var(--tx)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            복호화
          </span>
          {!locked && !completed && (
            <StepHelp
              title="복호화" color="var(--step4)"
              formula={`m = ${puzzle.c}^d  mod  ${puzzle.n}`}
              items={[
                { label: '① 계산기 열기', value: "'🧮 계산기' 버튼" },
                { label: `② ${puzzle.c} 입력`, value: '암호문 c' },
                { label: '③ pow 버튼', value: '거듭제곱' },
                { label: '④ d 입력', value: 'Step 3 정답' },
                { label: `⑤ mod → ${puzzle.n}`, value: '→ =  버튼' },
                { label: '⑥ → STEP 4', value: '자동 입력' },
              ]}
              tip="계산기 결과를 '→ STEP 4' 버튼으로 자동 입력하면 편합니다."
            />
          )}
          {completed && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '1rem' }}>✓ DECRYPTED</span>}
          {locked    && <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.7rem' }}>🔒 LOCKED</span>}
        </div>

        {/* 공식 */}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', color: 'var(--green)', background: 'rgba(0,255,136,0.05)', borderLeft: '2px solid var(--green)', padding: '0.4rem 0.75rem', marginBottom: '1rem' }}>
          m ≡ c<sup>d</sup> (mod n) &nbsp;
          <span style={{ color: 'var(--cyan)', fontSize: '0.85rem' }}>
            = {puzzle.c}<sup>{d}</sup> mod {puzzle.n}
          </span>
        </div>

        {/* 입력 + 버튼 */}
        {!completed && !locked && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--tx2)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>m =</span>
              <input
                type="number" value={val}
                onChange={e => { setVal(e.target.value); setErr('') }}
                placeholder="?"
                style={{
                  width: '7rem', padding: '0.4rem 0.6rem',
                  background: 'var(--bg-input)', border: `1px solid ${color}`,
                  color: 'var(--green)', fontFamily: 'JetBrains Mono', fontSize: '0.9rem',
                  outline: 'none', textAlign: 'center',
                }}
              />
              <button
                onClick={() => setShowCalc(v => !v)}
                style={{
                  padding: '0.4rem 0.9rem',
                  background: showCalc ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.3)', color: 'var(--cyan)',
                  fontFamily: 'JetBrains Mono', fontSize: '0.72rem', cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                🧮 계산기
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '0.4rem 1.2rem', background: color, color: 'var(--bg)',
                  border: 'none', fontFamily: 'Rajdhani', fontSize: '0.85rem',
                  fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                제출
              </button>
            </div>

            {/* 인라인 계산기 */}
            {showCalc && (
              <div style={{ marginTop: '1rem' }}>
                <Calculator onPaste={v => { setVal(String(v)); setErr('') }} />
              </div>
            )}
          </>
        )}

        {/* 정답 표시 */}
        {completed && (
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: '1rem',
            color: 'var(--green)', letterSpacing: '0.05em',
          }}>
            m = <strong style={{ fontSize: '1.3rem', textShadow: '0 0 12px var(--green)' }}>{answer}</strong>
            &nbsp;
            <span style={{ color: 'var(--tx2)', fontSize: '0.78rem' }}>
              ({puzzle.c}^{d} mod {puzzle.n} = {answer} ✓)
            </span>
          </div>
        )}

        {err && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--mag)' }}>⚠ {err}</div>}
      </div>
    </div>
  )
}
