import { useState } from 'react'
import type { RSAPuzzle } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import StepHelp  from '@/components/ui/StepHelp'
import Calculator from '@/components/ui/Calculator'

interface Props {
  puzzle:    RSAPuzzle
  phiN:      number
  onSubmit:  (d: number) => 'correct' | 'wrong'
  completed: boolean
  locked:    boolean
  answer:    number | null
  blindMode?: boolean
}

export default function StepPrivateKey({ puzzle, phiN, onSubmit, completed, locked, answer, blindMode = false }: Props) {
  // blindMode이면 항상 free 입력 모드 강제 (e를 직접 추론해야 하므로)
  const mode = blindMode ? 'free' : DIFFICULTY_CONFIG[puzzle.difficulty].step3Mode
  const [val,      setVal]      = useState(answer?.toString() ?? '')
  const [err,      setErr]      = useState('')
  const [wrong,    setWrong]    = useState<number[]>([])
  const [showCalc, setShowCalc] = useState(false)

  const candidates = puzzle.hints.dCandidates ?? []

  function submit(d: number) {
    const result = onSubmit(d)
    if (result === 'wrong') {
      // blindMode: e 값 노출 금지
      setErr(blindMode ? `d = ${d} 는 유효하지 않습니다. 다른 e 후보로 다시 계산하세요.` : `${puzzle.e} × ${d} mod ${phiN} ≠ 1`)
      setWrong(prev => [...prev, d])
    } else {
      setErr('')
    }
  }

  function handleFreeSubmit() {
    const d = parseInt(val)
    if (isNaN(d)) { setErr('값을 입력하세요.'); return }
    submit(d)
  }

  /* 계산기 결과를 입력창에 붙여넣기
     e × d mod φ(n) = 1 이면 자동 제출 */
  function handleCalcPaste(v: number) {
    if (v === 1) {
      // 계산기에서 1이 나오면 d는 이미 계산된 마지막 피연산자 — 자동 제출은 안 하고 안내만
      setErr('결과가 1이면 마지막으로 입력한 d를 제출하세요.')
    } else {
      setVal(String(v))
    }
  }

  const color = 'var(--step3)'

  return (
    <div style={{
      padding: '1.25rem',
      background: locked ? 'rgba(255,255,255,0.01)' : 'var(--bg-card)',
      border: `1px solid ${completed ? 'rgba(245,158,11,0.4)' : locked ? 'var(--border)' : 'rgba(245,158,11,0.2)'}`,
      opacity: locked ? 0.45 : 1, transition: 'all 0.3s', position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '3px', height: '100%', background: locked ? 'var(--tx3)' : color, opacity: locked ? 0.3 : 1 }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: locked ? 'var(--tx3)' : color, background: locked ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.12)', padding: '0.15rem 0.55rem', border: `1px solid ${locked ? 'var(--border)' : 'rgba(245,158,11,0.3)'}` }}>
            STEP 03
          </span>
          <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, color: locked ? 'var(--tx3)' : 'var(--tx)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            개인키 계산
          </span>
          {!locked && !completed && !blindMode && (
            <StepHelp
              title="개인키 d 계산" color="var(--step3)"
              formula={`${puzzle.e} × d ≡ 1  (mod ${phiN})`}
              items={[
                { label: 'd = 1부터 대입', value: `${puzzle.e} × d mod ${phiN} = 1 인 d` },
                { label: '계산기 확인법', value: `e × d  mod  φ(n) = ?` },
                { label: '결과가 1이면', value: '정답!' },
              ]}
              tip="계산기에서 e × d mod φ(n) 을 계산해 1이 나오는 d를 찾으세요."
            />
          )}
          {completed && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '1rem' }}>✓</span>}
          {locked    && <span style={{ marginLeft: 'auto', color: 'var(--tx3)', fontSize: '0.7rem' }}>🔒 LOCKED</span>}
        </div>

        {/* 공식 */}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', color: 'var(--green)', background: 'rgba(0,255,136,0.05)', borderLeft: '2px solid var(--green)', padding: '0.4rem 0.75rem', marginBottom: '1rem' }}>
          e × d ≡ 1 (mod φ(n)) &nbsp;
          <span style={{ color: 'var(--tx2)', fontSize: '0.78rem' }}>
            → {blindMode ? '? × d ≡ 1' : `${puzzle.e} × d ≡ 1`} (mod {phiN})
          </span>
        </div>

        {/* BLIND MODE 힌트 박스 */}
        {blindMode && !locked && !completed && (
          <div style={{ padding: '0.65rem 0.9rem', background: 'rgba(170,68,255,0.08)', border: '1px solid rgba(170,68,255,0.3)', fontSize: '0.72rem', color: '#aa44ff', marginBottom: '1rem', lineHeight: 1.7, fontFamily: 'JetBrains Mono' }}>
            🔍 e 는 공통 후보 <strong>[3, 5, 7, 11, 13, 17, 19, 23]</strong> 중 하나입니다.<br />
            각 e 에 대해 계산기로 <strong>e × d mod {phiN} = 1</strong> 인 d 를 찾아 제출하세요.
          </div>
        )}

        {/* CHOICE 모드 */}
        {(mode === 'choice3' || mode === 'choice5') && !completed && !locked && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--tx3)', marginBottom: '0.5rem', letterSpacing: '0.15em' }}>
              d를 선택하세요 — 계산기로 e × d mod φ(n) = 1 인지 확인할 수 있습니다:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              {candidates.map(d => {
                const isWrong = wrong.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => !isWrong && submit(d)}
                    disabled={isWrong}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: isWrong ? 'rgba(255,45,120,0.08)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${isWrong ? 'rgba(255,45,120,0.25)' : 'rgba(245,158,11,0.35)'}`,
                      color: isWrong ? 'var(--tx3)' : color,
                      fontFamily: 'JetBrains Mono', fontSize: '0.9rem',
                      cursor: isWrong ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s', textDecoration: isWrong ? 'line-through' : 'none',
                      opacity: isWrong ? 0.4 : 1,
                    }}
                    onMouseEnter={e => !isWrong && (e.currentTarget.style.background = 'rgba(245,158,11,0.22)')}
                    onMouseLeave={e => !isWrong && (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* FREE 모드 */}
        {mode === 'free' && !completed && !locked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--tx2)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>d =</span>
            <input
              type="number" value={val}
              onChange={e => { setVal(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleFreeSubmit()}
              placeholder="?"
              style={{ width: '7rem', padding: '0.4rem 0.6rem', background: 'var(--bg-input)', border: `1px solid ${color}`, color: 'var(--green)', fontFamily: 'JetBrains Mono', fontSize: '0.9rem', outline: 'none', textAlign: 'center' }}
            />
            <button onClick={handleFreeSubmit} style={{ padding: '0.4rem 1.1rem', background: color, color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase' }}>제출</button>
          </div>
        )}

        {/* 계산기 버튼 — choice 모드 포함 모든 활성 상태에서 표시 */}
        {!completed && !locked && (
          <div style={{ marginBottom: err ? '0' : '0' }}>
            <button
              onClick={() => setShowCalc(v => !v)}
              style={{
                padding: '0.35rem 0.9rem',
                background: showCalc ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.07)',
                border: `1px solid ${showCalc ? color : 'rgba(245,158,11,0.25)'}`,
                color: color,
                fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
                cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.2s',
              }}
            >
              🧮 계산기 {showCalc ? '닫기' : '열기'}
            </button>

            {showCalc && (
              <div style={{ marginTop: '0.75rem' }}>
                {/* 계산기 사용법 안내 */}
                <div style={{ fontSize: '0.68rem', color: 'var(--warn)', marginBottom: '0.5rem', fontFamily: 'JetBrains Mono', lineHeight: 1.6 }}>
                  {blindMode
                    ? <>💡 사용법: e 후보 입력 → <strong>×</strong> → d 값 → <strong>mod</strong> → <strong>{phiN}</strong> → <strong>=</strong> → 결과가 <strong>1</strong>이면 해당 (e, d) 쌍이 정답!</>
                    : <>💡 사용법: <strong>{puzzle.e}</strong> 입력 → <strong>×</strong> → d 후보 → <strong>mod</strong> → <strong>{phiN}</strong> → <strong>=</strong> → 결과가 <strong>1</strong>이면 정답!</>
                  }
                </div>
                <Calculator onPaste={handleCalcPaste} />
              </div>
            )}
          </div>
        )}

        {/* 정답 표시 */}
        {completed && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'var(--green)' }}>
            d = <strong>{answer}</strong> &nbsp;
            <span style={{ color: 'var(--tx2)', fontSize: '0.78rem' }}>
              {blindMode ? `(e × ${answer} mod ${phiN} = 1 ✓)` : `(${puzzle.e} × ${answer} mod ${phiN} = 1 ✓)`}
            </span>
          </div>
        )}

        {err && <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--mag)' }}>⚠ {err}</div>}
      </div>
    </div>
  )
}
