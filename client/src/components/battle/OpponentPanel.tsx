import type { BattlePlayer } from '@/types'

interface Props {
  opponent: BattlePlayer | null
  isSkillBlocked?: boolean
}

const STEP_LABELS = ['소인수분해', 'φ(n) 계산', '개인키 d', '복호화']
const STEP_COLORS = ['var(--step1)', 'var(--step2)', 'var(--step3)', 'var(--step4)']

export default function OpponentPanel({ opponent, isSkillBlocked }: Props) {
  if (!opponent) {
    return (
      <div className="hud mag" style={{ padding: '1.25rem', minWidth: 220 }}>
        <div className="panel-tag" style={{ color: 'var(--mag)' }}>OPPONENT</div>
        <div style={{ color: 'var(--tx3)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>
          대기 중...
        </div>
      </div>
    )
  }

  const pct = ((opponent.currentStep - 1) / 4) * 100

  return (
    <div className="hud mag" style={{ padding: '1.25rem', minWidth: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className="panel-tag" style={{ color: 'var(--mag)', marginBottom: 0 }}>OPPONENT</span>
        {isSkillBlocked && (
          <span style={{ fontSize: '0.6rem', color: 'var(--green)', border: '1px solid var(--green)', padding: '0.1rem 0.4rem', letterSpacing: '0.1em' }}>
            🛡 SHIELDED
          </span>
        )}
      </div>

      {/* 닉네임 */}
      <div style={{ fontFamily: 'Rajdhani', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--mag)', marginBottom: '0.75rem', textShadow: '0 0 10px rgba(255,45,120,0.4)' }}>
        {opponent.nickname}
      </div>

      {/* 진행 바 */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--tx3)', marginBottom: '0.3rem', letterSpacing: '0.15em' }}>
          <span>PROGRESS</span>
          <span>STEP {opponent.currentStep}/4</span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'var(--mag)',
            boxShadow: '0 0 8px var(--mag)',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* 단계별 상태 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const done    = opponent.currentStep > stepNum
          const active  = opponent.currentStep === stepNum
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.3rem 0.5rem',
              background: active ? `${STEP_COLORS[i]}11` : 'transparent',
              border: active ? `1px solid ${STEP_COLORS[i]}33` : '1px solid transparent',
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: done ? 'var(--green)' : active ? STEP_COLORS[i] : 'var(--tx3)',
                boxShadow: active ? `0 0 6px ${STEP_COLORS[i]}` : done ? '0 0 6px var(--green)' : 'none',
                flexShrink: 0,
                animation: active ? 'blink 1.2s infinite' : 'none',
              }} />
              <span style={{ fontSize: '0.68rem', color: done ? 'var(--green)' : active ? 'var(--tx)' : 'var(--tx3)', letterSpacing: '0.05em' }}>
                {String(stepNum).padStart(2,'0')}. {label}
              </span>
              {done && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '0.7rem' }}>✓</span>}
            </div>
          )
        })}
      </div>

      {/* 점수 */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
        <span style={{ color: 'var(--tx3)', letterSpacing: '0.15em' }}>SCORE</span>
        <span style={{ fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, color: 'var(--mag)' }}>
          {opponent.score}
        </span>
      </div>
    </div>
  )
}
