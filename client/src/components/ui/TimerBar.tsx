import { useEffect, useRef, useState } from 'react'

interface Props {
  totalSec: number | null   // null = 제한 없음
  onTimeUp: () => void
  penaltyTrigger: number    // 증가할 때마다 penaltySec 차감
  penaltySec: number
}

export default function TimerBar({ totalSec, onTimeUp, penaltyTrigger, penaltySec }: Props) {
  const [remaining, setRemaining] = useState(totalSec ?? 0)
  const [flash, setFlash]         = useState(false)
  const prevTrigger               = useRef(penaltyTrigger)
  const calledTimeUp              = useRef(false)

  /* 패널티 트리거 감지 */
  useEffect(() => {
    if (penaltyTrigger > prevTrigger.current && penaltySec > 0) {
      prevTrigger.current = penaltyTrigger
      setRemaining(r => Math.max(0, r - penaltySec))
      setFlash(true)
      setTimeout(() => setFlash(false), 700)
    }
  }, [penaltyTrigger, penaltySec])

  /* 카운트다운 */
  useEffect(() => {
    if (totalSec === null) return
    calledTimeUp.current = false
    setRemaining(totalSec)
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [totalSec, onTimeUp])

  /* 남은 시간이 0이 됐을 때도 호출 보장 */
  useEffect(() => {
    if (totalSec !== null && remaining === 0 && !calledTimeUp.current) {
      calledTimeUp.current = true
      onTimeUp()
    }
  }, [remaining, totalSec, onTimeUp])

  if (totalSec === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ flex: 1, height: '3px', background: 'rgba(0,255,136,0.15)' }} />
        <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', color: 'var(--green)', letterSpacing: '0.1em' }}>
          ∞
        </span>
      </div>
    )
  }

  const pct   = totalSec > 0 ? (remaining / totalSec) * 100 : 0
  const color = pct > 50 ? 'var(--green)' : pct > 25 ? 'var(--warn)' : 'var(--mag)'
  const mm    = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss    = String(remaining % 60).padStart(2, '0')

  return (
    <>
      {/* 25% 미만 → 화면 테두리 펄스 */}
      {pct < 25 && pct > 0 && (
        <div style={{
          position: 'fixed', inset: 0, border: '2px solid var(--mag)',
          pointerEvents: 'none', zIndex: 50,
          animation: 'glow-pulse 0.9s infinite',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* 바 */}
        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: color,
            boxShadow: `0 0 10px ${color}`,
            transition: 'width 0.9s linear, background 0.4s',
          }} />
          {/* 패널티 플래시 */}
          {flash && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,45,120,0.45)',
              animation: 'fadeIn 0.1s',
            }} />
          )}
        </div>

        {/* 시계 */}
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '1.15rem', fontWeight: 700,
          color: flash ? 'var(--mag)' : color,
          letterSpacing: '0.1em', minWidth: '3.8rem',
          textAlign: 'right', textShadow: `0 0 10px ${color}`,
          transition: 'color 0.3s',
        }}>
          {mm}:{ss}
        </span>
      </div>
    </>
  )
}
