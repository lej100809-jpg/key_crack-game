import { useEffect, useCallback } from 'react'
import type { Difficulty } from '@/types'
import { DIFFICULTY_CONFIG } from '@/types'
import { usePuzzleStore, selectRemainingHints } from '@/store/usePuzzleStore'
import TimerBar           from '@/components/ui/TimerBar'
import HintPanel          from '@/components/ui/HintPanel'
import ConsumableToolbar  from '@/components/ui/ConsumableToolbar'
import StepFactorize      from './StepFactorize'
import StepPhi            from './StepPhi'
import StepPrivateKey     from './StepPrivateKey'
import StepDecrypt        from './StepDecrypt'

interface Props {
  difficulty:         Difficulty
  blindMode?:         boolean         // e 값 숨김 (BLIND VAULT 전용)
  timeLimitOverride?: number | null   // undefined = 난이도 기본값
  onSolve?:           (timeSec: number, hintsUsed: number) => void
  onFail?:            () => void
  onReset?:           () => void
}

export default function PuzzleBoard({ difficulty, blindMode = false, timeLimitOverride, onSolve, onFail, onReset }: Props) {
  const {
    puzzle, _solution, currentStep, inputs, hintsUsed, status,
    penaltyTotal, timeBonus, wrongFlash,
    loadPuzzle, submitFactorize, submitStep, useHint, resetPuzzle, clearWrongFlash,
  } = usePuzzleStore()

  const remainingHints = usePuzzleStore(selectRemainingHints)
  const cfg = DIFFICULTY_CONFIG[difficulty]
  // timeLimitOverride가 있으면 우선 적용, 없으면 난이도 기본값
  const baseSec = timeLimitOverride !== undefined ? timeLimitOverride : cfg.timeLimitSec
  const effectiveTotalSec = baseSec !== null ? baseSec + timeBonus : null

  // onTimeUp을 useCallback으로 고정 — 인라인 화살표 함수이면 매 렌더마다 새 참조가 생겨
  // TimerBar의 useEffect([totalSec, onTimeUp])이 발화해 타이머가 리셋되는 버그 방지
  const handleTimeUp = useCallback(() => {
    usePuzzleStore.setState({ status: 'failed' })
  }, [])

  /* 마운트 시 퍼즐 로드 */
  useEffect(() => { loadPuzzle(difficulty) }, [difficulty, loadPuzzle])

  /* 성공/실패 콜백 */
  useEffect(() => {
    if (status === 'success' && onSolve && puzzle) {
      const elapsed = Math.floor((Date.now() - usePuzzleStore.getState().startedAt) / 1000) + penaltyTotal
      onSolve(elapsed, hintsUsed)
    }
    if (status === 'failed' && onFail) onFail()
  }, [status])

  /* 오답 흔들림 자동 초기화 */
  useEffect(() => {
    if (!wrongFlash) return
    const id = setTimeout(clearWrongFlash, 500)
    return () => clearTimeout(id)
  }, [wrongFlash, clearWrongFlash])

  if (!puzzle || !_solution) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tx3)', fontFamily: 'JetBrains Mono' }}>
        LOADING PUZZLE...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ── 메인 퍼즐 패널 ─────────────────────────────────────── */}
      <div style={{ flex: '1 1 580px', minWidth: 0 }}>

        {/* 공개키 헤더 */}
        <div className="hud" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>

            {/* 공개키 */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--tx3)' }}>PUBLIC KEY</span>
              <KeyVal label="n" value={puzzle.n} color="var(--cyan)" />
              {blindMode
                ? <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--tx3)' }}>e =</span>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: '1.3rem', fontWeight: 700, color: '#aa44ff', textShadow: '0 0 10px #aa44ff', letterSpacing: '0.1em' }}>???</span>
                  </div>
                : <KeyVal label="e" value={puzzle.e} color="var(--cyan)" />
              }
            </div>

            {/* 암호문 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--tx3)' }}>CIPHERTEXT</span>
              <KeyVal label="c" value={puzzle.c} color="var(--mag)" />
            </div>

            {/* 힌트 카운터 + 소모품 툴바 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: remainingHints > 0 ? 'var(--green)' : 'var(--tx3)' }}>
                💡 {remainingHints}/{cfg.hintCount === 99 ? '∞' : cfg.hintCount}
              </span>
              <ConsumableToolbar totalSec={effectiveTotalSec} />
            </div>
          </div>

          {/* 타이머 */}
          <TimerBar
            totalSec={effectiveTotalSec}
            onTimeUp={handleTimeUp}
            penaltyTrigger={penaltyTotal}
            penaltySec={cfg.wrongPenaltySec}
          />
        </div>

        {/* 성공 배너 */}
        {status === 'success' && (
          <div style={{
            padding: '1.25rem', marginBottom: '1rem', textAlign: 'center',
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.4)',
            boxShadow: '0 0 24px rgba(0,255,136,0.12)',
          }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.2em', textShadow: '0 0 16px var(--green)' }}>
              🔓 DECRYPTED
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--tx2)', marginTop: '0.4rem' }}>
              원본 메시지: <strong style={{ color: 'var(--green)', fontSize: '1rem' }}>{inputs.m}</strong>
            </div>
            <button
              onClick={() => { resetPuzzle(); loadPuzzle(difficulty) }}
              style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'var(--green)', color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              새 문제
            </button>
          </div>
        )}

        {/* 실패 배너 */}
        {status === 'failed' && (
          <div style={{
            padding: '1.25rem', marginBottom: '1rem', textAlign: 'center',
            background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.4)',
          }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', fontWeight: 700, color: 'var(--mag)', letterSpacing: '0.2em' }}>
              ⏱ TIME EXPIRED
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button onClick={() => { resetPuzzle(); loadPuzzle(difficulty) }}
                style={{ padding: '0.5rem 1.5rem', background: 'var(--mag)', color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase' }}>
                재도전
              </button>
              {onReset && (
                <button onClick={onReset}
                  style={{ padding: '0.5rem 1.5rem', background: 'transparent', color: 'var(--tx2)', border: '1px solid var(--border)', fontFamily: 'Rajdhani', fontSize: '0.9rem', cursor: 'pointer' }}>
                  나가기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4단계 스텝 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: wrongFlash ? 'shake 0.4s ease' : undefined }}>

          <StepFactorize
            puzzle={puzzle}
            onSubmit={submitFactorize}
            completed={currentStep > 1}
            locked={false}
            inputs={{ p: inputs.p, q: inputs.q }}
          />

          <StepPhi
            puzzle={puzzle}
            prevP={inputs.p ?? _solution.p}
            prevQ={inputs.q ?? _solution.q}
            onSubmit={v => submitStep(2, v)}
            completed={currentStep > 2}
            locked={currentStep < 2}
            answer={inputs.phiN}
          />

          <StepPrivateKey
            puzzle={puzzle}
            phiN={inputs.phiN ?? _solution.phiN}
            onSubmit={v => submitStep(3, v)}
            completed={currentStep > 3}
            locked={currentStep < 3}
            answer={inputs.d}
            blindMode={blindMode}
          />

          <StepDecrypt
            puzzle={puzzle}
            d={inputs.d ?? _solution.d}
            onSubmit={v => submitStep(4, v)}
            completed={status === 'success'}
            locked={currentStep < 4}
            answer={inputs.m}
          />
        </div>
      </div>

      {/* ── 사이드 패널 (힌트) ────────────────────────────────── */}
      {cfg.hintCount > 0 && cfg.hintCount !== 0 && (
        <div style={{ width: '220px', flexShrink: 0 }}>
          <HintPanel
            puzzle={puzzle}
            hintsUsed={hintsUsed}
            onUseHint={useHint}
            currentStep={currentStep}
          />
        </div>
      )}
    </div>
  )
}

/* ── 공개키 표시 미니 컴포넌트 ──────────────────────────── */
function KeyVal({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--tx3)' }}>{label} =</span>
      <span style={{ fontFamily: 'Rajdhani', fontSize: '1.3rem', fontWeight: 700, color, textShadow: `0 0 10px ${color}` }}>
        {value}
      </span>
    </div>
  )
}
