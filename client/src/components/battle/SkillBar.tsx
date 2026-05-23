import { useState, useEffect } from 'react'
import type { SkillType } from '@/types'
import { SKILLS } from '@/types'

interface Props {
  availableSkills: SkillType[]
  cooldowns:       Record<SkillType, number>  // 남은 쿨타임(초)
  shieldActive:    boolean
  onUse:           (skill: SkillType) => void
  disabled?:       boolean
}

const SKILL_ORDER: SkillType[] = ['fake_hint', 'time_cut', 'shield', 'bonus_hint']
const SKILL_COLOR: Record<SkillType, string> = {
  fake_hint:  'var(--mag)',
  time_cut:   'var(--warn)',
  shield:     'var(--cyan)',
  bonus_hint: 'var(--green)',
}

export default function SkillBar({ availableSkills, cooldowns, shieldActive, onUse, disabled }: Props) {
  const [localCds, setLocalCds] = useState<Record<SkillType, number>>({ ...cooldowns })

  /* 1초마다 쿨타임 감소 */
  useEffect(() => {
    const id = setInterval(() => {
      setLocalCds(prev => {
        const next = { ...prev }
        ;(Object.keys(next) as SkillType[]).forEach(k => { if (next[k] > 0) next[k]-- })
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  /* 서버에서 온 쿨타임으로 동기화 */
  useEffect(() => { setLocalCds({ ...cooldowns }) }, [cooldowns])

  return (
    <div className="hud" style={{ padding: '1rem' }}>
      <div className="panel-tag">SKILLS</div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {SKILL_ORDER.filter(s => availableSkills.includes(s)).map(skill => {
          const def    = SKILLS[skill]
          const cd     = localCds[skill] ?? 0
          const isReady = cd === 0
          const color   = SKILL_COLOR[skill]
          const isShield = skill === 'shield' && shieldActive

          return (
            <button
              key={skill}
              onClick={() => isReady && !disabled && onUse(skill)}
              disabled={!isReady || !!disabled}
              title={def.description}
              style={{
                position: 'relative', overflow: 'hidden',
                padding: '0.55rem 0.85rem',
                background: isShield
                  ? 'rgba(0,212,255,0.18)'
                  : isReady
                    ? `${color}14`
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isReady ? color : 'var(--tx3)'}`,
                color: isReady ? color : 'var(--tx3)',
                fontFamily: 'JetBrains Mono', fontSize: '0.72rem',
                cursor: isReady && !disabled ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', minWidth: 90,
                opacity: isReady ? 1 : 0.55,
                boxShadow: isShield ? `0 0 12px var(--cyan-dim)` : isReady ? `0 0 8px ${color}22` : 'none',
              }}
              onMouseEnter={e => isReady && !disabled && (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = isReady ? '1' : '0.55')}
            >
              {/* 쿨타임 오버레이 */}
              {!isReady && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0,
                  height: `${(cd / def.cooldownSec) * 100}%`,
                  width: '100%',
                  background: 'rgba(0,0,0,0.45)',
                  transition: 'height 1s linear',
                }} />
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '1rem', marginBottom: '0.15rem' }}>
                  {def.label.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                  {isReady ? def.label.slice(def.label.indexOf(' ')+1) : `${cd}s`}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {availableSkills.length === 0 && (
        <div style={{ color: 'var(--tx3)', fontSize: '0.72rem', marginTop: '0.25rem' }}>
          스킬은 Round 3 이후 활성화됩니다
        </div>
      )}
    </div>
  )
}
