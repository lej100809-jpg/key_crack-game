import { useState } from 'react'

interface HelpItem { label: string; value: string }

interface Props {
  title:   string
  formula: string
  color:   string
  items:   HelpItem[]
  tip:     string
}

export default function StepHelp({ title, formula, color, items, tip }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 22, height: 22, borderRadius: '50%',
          background: open ? color : 'transparent',
          border: `1px solid ${color}`,
          color: open ? 'var(--bg)' : color,
          fontFamily: 'JetBrains Mono', fontSize: '0.7rem', fontWeight: 700,
          cursor: 'pointer', lineHeight: 1, transition: 'all 0.2s',
        }}
        title="계산 방법 보기"
      >
        ?
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 28, left: 0, zIndex: 50,
          width: 280, background: 'var(--bg-panel)',
          border: `1px solid ${color}`, padding: '1rem',
          boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
        }}>
          {/* 닫기 */}
          <button onClick={() => setOpen(false)} style={{ position:'absolute', top:6, right:8, background:'none', border:'none', color:'var(--tx3)', cursor:'pointer', fontSize:'0.9rem' }}>✕</button>

          <div style={{ fontFamily:'Rajdhani', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color, marginBottom:'0.5rem' }}>
            {title} — 계산 방법
          </div>

          <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.78rem', color:'var(--green)', background:'rgba(0,255,136,0.07)', borderLeft:`2px solid ${color}`, padding:'0.35rem 0.6rem', marginBottom:'0.75rem' }}>
            {formula}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem', marginBottom:'0.75rem' }}>
            {items.map((it, i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.72rem', padding:'0.25rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color:'var(--tx3)', minWidth:110, fontFamily:'JetBrains Mono' }}>{it.label}</span>
                <span style={{ color:'var(--green)', fontFamily:'JetBrains Mono', fontWeight:600 }}>{it.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize:'0.68rem', color:'var(--warn)', lineHeight:1.6 }}>💡 {tip}</div>
        </div>
      )}
    </div>
  )
}
