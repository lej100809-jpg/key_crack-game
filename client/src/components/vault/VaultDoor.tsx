import { useEffect, useState } from 'react'
import type { VaultGrade } from '@/types'

interface Props {
  grade:      VaultGrade
  state:      'locked' | 'unlocking' | 'open' | 'failed'
  onOpenEnd?: () => void
  size?:      number
}

const GRADE: Record<VaultGrade, { color: string; glow: string; bg: string }> = {
  bronze:   { color: '#e08a3c', glow: 'rgba(224,138,60,0.7)',  bg: '#1a0e06' },
  silver:   { color: '#d4d4d4', glow: 'rgba(212,212,212,0.7)', bg: '#0e0e12' },
  gold:     { color: '#ffd700', glow: 'rgba(255,215,0,0.8)',   bg: '#191300' },
  platinum: { color: '#e8e6ff', glow: 'rgba(180,175,255,0.8)', bg: '#0d0c1a' },
}

// 애니메이션 단계
type Phase = 'idle' | 'spinning' | 'unbolting' | 'opening' | 'done' | 'fail'

export default function VaultDoor({ grade, state, onOpenEnd, size = 240 }: Props) {
  const { color, glow, bg } = GRADE[grade]
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    if (state === 'locked')  { setPhase('idle'); return }
    if (state === 'failed')  { setPhase('fail'); return }
    if (state === 'open')    { setPhase('done'); return }

    if (state === 'unlocking') {
      setPhase('spinning')
      const t1 = setTimeout(() => setPhase('unbolting'), 1400)
      const t2 = setTimeout(() => setPhase('opening'),   2000)
      const t3 = setTimeout(() => { setPhase('done'); onOpenEnd?.() }, 2900)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [state, onOpenEnd])

  const s = size
  const isOpen = phase === 'done'
  const isSpin = phase === 'spinning'
  const isUnbolt = phase === 'unbolting'
  const isSlide = phase === 'opening' || phase === 'done'
  const isFail = phase === 'fail'

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.85rem', userSelect:'none' }}>

      {/* ── 금고 전체 프레임 ───────────────────────────── */}
      <div style={{
        width: s, height: s, position:'relative', overflow:'hidden',
        background: bg,
        border: `2px solid ${isFail ? 'var(--mag)' : color}`,
        boxShadow: isFail
          ? '0 0 24px rgba(255,45,120,0.5), inset 0 0 24px rgba(255,45,120,0.15)'
          : isOpen
            ? `0 0 40px ${glow}, 0 0 80px ${color}33`
            : `0 0 20px ${color}44`,
        transition: 'box-shadow 0.4s, border-color 0.3s',
        animation: isFail ? 'vault-fail-flash 0.3s ease 3' : 'none',
      }}>

        {/* 내부 배경 (열렸을 때 빛남) */}
        <div style={{
          position:'absolute', inset:0,
          background: isOpen
            ? `radial-gradient(ellipse at 60% 50%, ${color}33 0%, ${color}11 45%, transparent 70%)`
            : 'transparent',
          transition: 'background 0.6s',
          zIndex: 0,
        }} />

        {/* ── 문짝 ─────────────────────────────────────── */}
        <div style={{
          position:'absolute', inset: 6,
          background: `linear-gradient(140deg, #1c1e2e 0%, #10111e 50%, #14152a 100%)`,
          border: `1px solid ${color}55`,
          zIndex: 2,
          // 슬라이드 오픈 애니메이션
          animation: isSlide ? `door-slide-open 0.75s cubic-bezier(0.4,0,0.2,1) forwards` : 'none',
          transformOrigin: 'left center',
        }}>

          {/* 메인 다이얼 링 */}
          <div style={{
            position:'absolute', left:'50%', top:'50%',
            width: s * 0.56, height: s * 0.56,
            border: `2px solid ${color}`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, ${color}22, transparent 70%)`,
            boxShadow: `0 0 16px ${glow}, inset 0 0 12px rgba(0,0,0,0.7)`,
            animation: isSpin
              ? `dial-spin 1.2s cubic-bezier(0.4,0,0.6,1) forwards`
              : 'none',
            // 멈춤 위치는 720deg (forwards 유지)
            transform: 'translate(-50%,-50%)',
          }}>
            {/* 눈금 12개 */}
            {Array.from({length:12}).map((_,i) => (
              <div key={i} style={{
                position:'absolute', left:'50%', top:3,
                width: i%3===0 ? 3 : 2,
                height: i%3===0 ? 12 : 7,
                marginLeft: i%3===0 ? -1.5 : -1,
                background: i%3===0 ? color : `${color}88`,
                transformOrigin: `50% ${s*0.28-3}px`,
                transform: `rotate(${i*30}deg)`,
              }} />
            ))}
            {/* 중심 허브 */}
            <div style={{
              position:'absolute', left:'50%', top:'50%',
              transform:'translate(-50%,-50%)',
              width: s*0.12, height: s*0.12,
              borderRadius:'50%',
              background:`radial-gradient(circle at 35% 35%, ${color}, ${color}77)`,
              boxShadow:`0 0 12px ${glow}`,
            }} />
            {/* 핸들 바 */}
            <div style={{
              position:'absolute', left:'50%', top:'50%',
              width: s*0.18, height: 4, marginTop:-2,
              background: color, borderRadius:3,
              boxShadow: `0 0 6px ${glow}`,
            }} />
          </div>

          {/* 볼트 4개 */}
          {[
            { style:{ top:6, left:'50%', transform:'translateX(-50%)', width:10, height:22, animation: isUnbolt||isSlide ? 'bolt-retract-top 0.4s ease forwards' : 'none' } },
            { style:{ bottom:6, left:'50%', transform:'translateX(-50%)', width:10, height:22, animation: isUnbolt||isSlide ? 'bolt-retract-bottom 0.4s ease forwards' : 'none' } },
            { style:{ left:6, top:'50%', transform:'translateY(-50%)', width:22, height:10, animation: isUnbolt||isSlide ? 'bolt-retract-left 0.4s ease forwards' : 'none' } },
            { style:{ right:6, top:'50%', transform:'translateY(-50%)', width:22, height:10, animation: isUnbolt||isSlide ? 'bolt-retract-right 0.4s ease forwards' : 'none' } },
          ].map((b,i) => (
            <div key={i} style={{
              position:'absolute',
              ...b.style,
              background:`linear-gradient(${i<2?'0':'90'}deg, ${color}88, ${color})`,
              borderRadius:4,
              boxShadow:`0 0 8px ${glow}`,
            }} />
          ))}

          {/* 문 등급 텍스트 */}
          <div style={{
            position:'absolute', bottom:10, left:0, right:0, textAlign:'center',
            fontFamily:'Rajdhani,sans-serif', fontSize:'0.6rem', fontWeight:700,
            letterSpacing:'0.3em', textTransform:'uppercase', color:`${color}99`,
          }}>
            {grade.toUpperCase()}
          </div>
        </div>

        {/* ── 열린 상태 내부 ───────────────────────────── */}
        {isOpen && (
          <div style={{
            position:'absolute', inset:6, zIndex:1,
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:8,
            animation:'vault-glow-in 0.5s ease forwards',
          }}>
            <div style={{ fontSize: s*0.18, lineHeight:1 }}>🔓</div>
            <div style={{
              fontFamily:'Rajdhani,sans-serif', fontSize:'0.8rem',
              fontWeight:700, letterSpacing:'0.25em', color,
              textShadow:`0 0 16px ${glow}`,
            }}>
              ACCESS<br/>GRANTED
            </div>
          </div>
        )}

        {/* 실패 오버레이 */}
        {isFail && (
          <div style={{
            position:'absolute', inset:0, zIndex:10,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:'rgba(255,45,120,0.08)',
          }}>
            <div style={{
              fontFamily:'Rajdhani,sans-serif', fontSize:'1rem',
              fontWeight:700, color:'var(--mag)', letterSpacing:'0.2em',
              textShadow:'0 0 12px var(--mag)',
            }}>
              ACCESS DENIED
            </div>
          </div>
        )}

        {/* 스파크 (잠금 해제 중) */}
        {isSpin && Array.from({length:6}).map((_,i) => (
          <div key={i} style={{
            position:'absolute',
            left: s/2 + Math.cos(i*60*Math.PI/180) * s*0.32,
            top:  s/2 + Math.sin(i*60*Math.PI/180) * s*0.32,
            width:5, height:5, borderRadius:'50%',
            background: color, boxShadow:`0 0 8px ${glow}`,
            zIndex:5,
            animation:`spark 0.4s ease ${i*0.08}s infinite`,
          }} />
        ))}

        {/* 코너 장식 */}
        {[[0,0],[s-16,0],[0,s-16],[s-16,s-16]].map(([x,y],i) => (
          <div key={i} style={{
            position:'absolute', left:x+2, top:y+2,
            width:12, height:12, zIndex:3,
            borderTop:    y===0   ? `2px solid ${color}` : 'none',
            borderBottom: y!==0   ? `2px solid ${color}` : 'none',
            borderLeft:   x===0   ? `2px solid ${color}` : 'none',
            borderRight:  x!==0   ? `2px solid ${color}` : 'none',
            opacity: 0.7,
          }} />
        ))}
      </div>

      {/* 상태 텍스트 */}
      <div style={{
        fontFamily:'JetBrains Mono,monospace', fontSize:'0.65rem',
        letterSpacing:'0.22em', textTransform:'uppercase',
        display:'flex', alignItems:'center', gap:6,
        color: isFail ? 'var(--mag)' : isOpen ? 'var(--green)' : phase!=='idle' ? color : 'var(--tx3)',
      }}>
        <span style={{
          width:7, height:7, borderRadius:'50%', flexShrink:0,
          background: isFail ? 'var(--mag)' : isOpen ? 'var(--green)' : phase!=='idle' ? color : 'var(--tx3)',
          boxShadow: isFail ? '0 0 6px var(--mag)' : isOpen ? '0 0 6px var(--green)' : phase!=='idle' ? `0 0 6px ${glow}` : 'none',
          animation: phase!=='idle' && !isOpen && !isFail ? 'blink 0.8s infinite' : 'none',
        }} />
        {isFail     ? 'ACCESS DENIED'
         : isOpen   ? 'ACCESS GRANTED'
         : isSpin   ? 'CRACKING DIAL...'
         : isUnbolt ? 'RETRACTING BOLTS...'
         : isSlide  ? 'OPENING...'
         :            `${grade.toUpperCase()} VAULT — SECURED`}
      </div>
    </div>
  )
}
