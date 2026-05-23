import { useState } from 'react'
import PixelIcon from './PixelIcon'
import { usePlayerStore } from '@/store/usePlayerStore'
import { usePuzzleStore } from '@/store/usePuzzleStore'

interface Props {
  totalSec: number | null   // TimerBar의 totalSec — 부활권에 사용
}

export default function ConsumableToolbar({ totalSec }: Props) {
  const inventory      = usePlayerStore(s => s.inventory)
  const useHintItem    = usePlayerStore(s => s.useHint)
  const useTimeExtend  = usePlayerStore(s => s.useTimeExtend)
  const useReviveStore = usePlayerStore(s => s.useRevive)

  const status     = usePuzzleStore(s => s.status)
  const reviveUsed = usePuzzleStore(s => s.reviveUsed)
  const { addBonusHint, applyTimeBonus, revive } = usePuzzleStore()

  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  function handleHint() {
    if (inventory.hints <= 0) { showToast('긴급 힌트가 없습니다.'); return }
    const ok = useHintItem()
    if (ok) { addBonusHint(); showToast('💡 힌트 +1 추가됨!') }
  }

  function handleTime() {
    if (inventory.timeExtends <= 0) { showToast('시간 연장권이 없습니다.'); return }
    if (!totalSec) { showToast('제한 시간이 없는 모드입니다.'); return }
    const bonus = useTimeExtend()
    if (bonus) { applyTimeBonus(bonus); showToast(`⏳ +${bonus}초 연장!`) }
  }

  function handleRevive() {
    if (inventory.revives <= 0) { showToast('부활권이 없습니다.'); return }
    if (status !== 'failed') { showToast('실패 시에만 사용 가능합니다.'); return }
    if (reviveUsed) { showToast('이미 부활권을 사용했습니다.'); return }
    const ok = useReviveStore()
    if (ok) { revive(totalSec ?? 120); showToast('💎 부활! 타이머 절반으로 재시작') }
  }

  const items = [
    {
      id: 'hint',   icon: 'bulb',      color: '#ffee44',
      label: '긴급 힌트',  count: inventory.hints,
      onClick: handleHint,
      disabled: inventory.hints <= 0 || status === 'success',
    },
    {
      id: 'time',   icon: 'hourglass', color: '#00d4ff',
      label: '+45초',      count: inventory.timeExtends,
      onClick: handleTime,
      disabled: inventory.timeExtends <= 0 || !totalSec || status !== 'solving',
    },
    {
      id: 'revive', icon: 'diamond',   color: '#ff44cc',
      label: '부활권',     count: inventory.revives,
      onClick: handleRevive,
      disabled: inventory.revives <= 0 || status !== 'failed' || reviveUsed,
    },
  ]

  // 모두 0개면 표시 안 함
  if (inventory.hints + inventory.timeExtends + inventory.revives === 0) return null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, background: 'var(--bg-panel)', border: '1px solid var(--green)',
          color: 'var(--green)', padding: '0.3rem 0.75rem',
          fontFamily: 'JetBrains Mono', fontSize: '0.68rem', letterSpacing: '0.08em',
          whiteSpace: 'nowrap', zIndex: 50, boxShadow: '0 4px 12px rgba(0,255,136,0.2)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            title={`${item.label} (보유: ${item.count})`}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.3rem 0.55rem',
              background: item.disabled ? 'rgba(255,255,255,0.03)' : `${item.color}14`,
              border: `1px solid ${item.disabled ? 'var(--tx3)' : item.color + '55'}`,
              color: item.disabled ? 'var(--tx3)' : item.color,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              opacity: item.disabled ? 0.45 : 1,
              transition: 'all 0.15s',
              position: 'relative',
            }}
            onMouseEnter={e => !item.disabled && (e.currentTarget.style.background = `${item.color}28`)}
            onMouseLeave={e => !item.disabled && (e.currentTarget.style.background = `${item.color}14`)}
          >
            <PixelIcon name={item.icon} scale={2} color={item.disabled ? '#3a4a5a' : item.color} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', letterSpacing: '0.08em' }}>
              {item.label}
            </span>
            {/* 보유 수량 배지 */}
            <span style={{
              position: 'absolute', top: -5, right: -5,
              width: 14, height: 14, borderRadius: '50%',
              background: item.count > 0 ? item.color : 'var(--tx3)',
              color: 'var(--bg)', fontSize: '0.5rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'JetBrains Mono',
            }}>
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
