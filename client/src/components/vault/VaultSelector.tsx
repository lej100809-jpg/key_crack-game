import { useState } from 'react'
import type { VaultGrade } from '@/types'
import { VAULT_CONFIG } from '@/types'
import VaultDoor from './VaultDoor'

interface Props {
  onSelect: (grade: VaultGrade) => void
}

const GRADE_ORDER: VaultGrade[] = ['bronze', 'silver', 'gold', 'platinum']
const GRADE_COLOR: Record<VaultGrade, string> = {
  bronze:   '#cd7f32',
  silver:   '#c0c0c0',
  gold:     '#ffd700',
  platinum: '#e5e4e2',
}

export default function VaultSelector({ onSelect }: Props) {
  const [hovered, setHovered] = useState<VaultGrade | null>(null)

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#ffd700', display: 'block', marginBottom: '0.4rem' }}>
          // VAULT MODE
        </span>
        <h2 style={{ fontFamily: 'Rajdhani', fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tx)', margin: 0 }}>
          금고 <span style={{ color: '#ffd700' }}>등급 선택</span>
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--tx2)', marginTop: '0.5rem' }}>
          등급이 높을수록 더 큰 소수, 더 짧은 시간, 더 적은 힌트
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', maxWidth: 1020, margin: '0 auto', alignItems: 'stretch' }}>
        {GRADE_ORDER.map(g => {
          const cfg   = VAULT_CONFIG[g]
          const color = GRADE_COLOR[g]
          const isHov = hovered === g
          return (
            <button
              key={g}
              onClick={() => onSelect(g)}
              onMouseEnter={() => setHovered(g)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isHov ? color : 'rgba(255,255,255,0.07)'}`,
                padding: '2rem 1.5rem',
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.3s',
                transform: isHov ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: isHov ? `0 12px 36px ${color}22` : 'none',
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
            >
              {/* 금고 문 미니 프리뷰 */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', transform: isHov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s', flexShrink: 0 }}>
                <VaultDoor grade={g} state={isHov ? 'unlocking' : 'locked'} size={180} />
              </div>

              {/* 스펙 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--tx2)', marginBottom: '1.25rem', textAlign: 'left', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--tx3)' }}>소수 범위</span>
                  <span>{cfg.primeRange[0]} – {cfg.primeRange[1]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--tx3)' }}>제한 시간</span>
                  <span>{cfg.timeLimitSec}초</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--tx3)' }}>힌트</span>
                  <span>{cfg.hintCount}회</span>
                </div>
                {cfg.isChained && (
                  <div style={{ color, fontSize: '0.68rem', borderTop: `1px solid ${color}33`, paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                    ⛓ 연쇄 RSA 챌린지
                  </div>
                )}
              </div>

              {/* 보상 */}
              <div style={{
                fontFamily: 'Rajdhani', fontSize: '1.3rem', fontWeight: 700, color: 'var(--green)',
                borderTop: '1px solid var(--border)', paddingTop: '0.75rem',
              }}>
                💰 {cfg.rewardCoins.toLocaleString()} coins
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
