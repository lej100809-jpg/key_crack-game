import { getTier, tierProgress, getNextTier, RANK_TIERS } from '@/data/rankSystem'
import PixelIcon from './PixelIcon'

interface Props {
  rp:       number
  showBar?: boolean   // 진행 바 표시 여부
  size?:    'sm' | 'md' | 'lg'
}

export default function RankBadge({ rp, showBar = false, size = 'md' }: Props) {
  const tier   = getTier(rp)
  const next   = getNextTier(rp)
  const pct    = tierProgress(rp)
  const iconSz = { sm: 2, md: 3, lg: 4 }[size]
  const nameSz = { sm: '0.65rem', md: '0.85rem', lg: '1.1rem' }[size]
  const rpSz   = { sm: '0.58rem', md: '0.7rem', lg: '0.85rem' }[size]

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* 도트 아이콘 */}
        <div style={{ filter: `drop-shadow(0 0 4px ${tier.glow})` }}>
          <PixelIcon name={tier.icon} scale={iconSz} color={tier.color} />
        </div>

        <div>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif', fontSize: nameSz,
            fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
            color: tier.color, textShadow: `0 0 8px ${tier.glow}`,
          }}>
            {tier.name}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: rpSz, color: 'var(--tx3)', letterSpacing: '0.1em' }}>
            {rp.toLocaleString()} RP
          </div>
        </div>
      </div>

      {/* 진행 바 */}
      {showBar && next && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct * 100}%`,
              background: tier.color,
              boxShadow: `0 0 8px ${tier.glow}`,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: 'var(--tx3)' }}>
            <span>{tier.name}</span>
            <span style={{ color: next.color }}>{next.name} ({next.minRP.toLocaleString()} RP)</span>
          </div>
        </div>
      )}

      {showBar && !next && (
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: tier.color, letterSpacing: '0.1em' }}>
          ★ MAX RANK
        </div>
      )}
    </div>
  )
}

/* 랭킹 포인트 추가 알림용 미니 팝업 */
interface GainProps {
  rp: number; label: string; onDone: () => void
}
export function RankGainToast({ rp, label, onDone }: GainProps) {
  return (
    <div
      style={{
        position: 'fixed', top: 80, right: 20, zIndex: 300,
        background: 'var(--bg-panel)', border: '1px solid var(--green)',
        padding: '0.75rem 1.25rem',
        boxShadow: '0 4px 20px rgba(0,255,136,0.25)',
        animation: 'fadeIn 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={onDone}
    >
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--tx3)', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
        RP 획득
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>
        +{rp.toLocaleString()} RP
      </div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--tx2)', marginTop: '0.15rem' }}>
        {label}
      </div>
    </div>
  )
}

/* 전체 티어 목록 (학습/랭킹 페이지용) */
export function TierList({ currentRp }: { currentRp: number }) {
  const currentTier = getTier(currentRp)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {RANK_TIERS.map(tier => {
        const isActive  = tier.id === currentTier.id
        const isUnlocked = currentRp >= tier.minRP
        return (
          <div key={tier.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.6rem 0.9rem',
            background: isActive ? `${tier.color}12` : 'var(--bg-card)',
            border: `1px solid ${isActive ? tier.color : isUnlocked ? `${tier.color}44` : 'var(--border)'}`,
            opacity: isUnlocked ? 1 : 0.45,
            transition: 'all 0.2s',
          }}>
            <div style={{ filter: isUnlocked ? `drop-shadow(0 0 3px ${tier.glow})` : 'none' }}>
              <PixelIcon name={tier.icon} scale={2} color={isUnlocked ? tier.color : 'var(--tx3)'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em', color: isUnlocked ? tier.color : 'var(--tx3)' }}>
                {tier.name}
                {isActive && <span style={{ marginLeft: '0.5rem', fontSize: '0.6rem', border: `1px solid ${tier.color}`, padding: '0.1rem 0.35rem', verticalAlign: 'middle' }}>CURRENT</span>}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--tx3)' }}>{tier.desc}</div>
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '0.8rem', color: isUnlocked ? tier.color : 'var(--tx3)', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {tier.minRP.toLocaleString()} RP{tier.maxRP !== -1 ? ` ~ ${tier.maxRP.toLocaleString()}` : ' +'}
            </div>
          </div>
        )
      })}
    </div>
  )
}
