import type { AgentSkin } from '@/data/shopItems'
import PixelChar from './PixelChar'

interface Props {
  skin:      AgentSkin
  nickname:  string
  title?:    string
  rating?:   number
  coins?:    number
  size?:     'sm' | 'md' | 'lg'
  onClick?:  () => void
  selected?: boolean
}

function PatternLayer({ pattern, color }: { pattern: string; color: string }) {
  const base: React.CSSProperties = { position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }
  if (pattern === 'grid')    return <div style={{ ...base, backgroundImage:`linear-gradient(${color}1a 1px,transparent 1px),linear-gradient(90deg,${color}1a 1px,transparent 1px)`, backgroundSize:'18px 18px' }} />
  if (pattern === 'circuit') return <div style={{ ...base, backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 17px,${color}18 18px),repeating-linear-gradient(90deg,transparent,transparent 17px,${color}18 18px)` }} />
  if (pattern === 'hex')     return <div style={{ ...base, background:`radial-gradient(circle at 25% 30%,${color}22,transparent 50%),radial-gradient(circle at 75% 70%,${color}18,transparent 50%)` }} />
  if (pattern === 'void')    return <div style={{ ...base, background:`radial-gradient(ellipse at 50% 40%,${color}18,transparent 65%)` }} />
  if (pattern === 'flame')   return <div style={{ ...base, background:`linear-gradient(to top,${color}2a 0%,${color}0a 55%,transparent 100%)` }} />
  return null
}

export default function AgentCard({ skin, nickname, title, rating, coins, size='md', onClick, selected }: Props) {
  const charScale   = { sm:2, md:3, lg:4 }[size]
  const cardW       = { sm:150, md:200, lg:270 }[size]
  const pad         = { sm:'0.7rem', md:'1rem', lg:'1.5rem' }[size]
  const nameFontSz  = { sm:'0.8rem', md:'1rem', lg:'1.3rem' }[size]
  const subFontSz   = { sm:'0.55rem', md:'0.65rem', lg:'0.8rem' }[size]
  const statFontSz  = { sm:'0.85rem', md:'1rem', lg:'1.3rem' }[size]

  return (
    <div
      onClick={onClick}
      style={{
        width: cardW, position:'relative', overflow:'hidden',
        background: skin.bg,
        border:`${selected?2:1}px solid ${selected ? skin.primary : skin.primary+'44'}`,
        boxShadow: selected
          ? `0 0 28px ${skin.glowColor}, 0 0 56px ${skin.glowColor}44`
          : `0 0 10px ${skin.glowColor}33`,
        cursor: onClick ? 'pointer' : 'default',
        transition:'all 0.25s',
        padding: pad,
      }}
    >
      <PatternLayer pattern={skin.pattern} color={skin.primary} />

      {/* EQUIPPED 배지 */}
      {selected && (
        <div style={{ position:'absolute', top:6, right:6, zIndex:2, fontFamily:'JetBrains Mono', fontSize:'0.52rem', color:skin.primary, border:`1px solid ${skin.primary}`, padding:'0.1rem 0.35rem', letterSpacing:'0.12em', background:`${skin.bg}cc` }}>
          EQUIPPED
        </div>
      )}

      {/* 스킨 이름 */}
      <div style={{ position:'relative', zIndex:1, fontFamily:'JetBrains Mono', fontSize:subFontSz, letterSpacing:'0.2em', color:`${skin.primary}cc`, textTransform:'uppercase', marginBottom:'0.5rem' }}>
        {skin.name}
      </div>

      {/* 도트 캐릭터 + 닉네임 */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'flex-end', gap:'0.75rem', marginBottom:'0.75rem' }}>
        {/* 도트 캐릭터 */}
        <div style={{ flexShrink:0, filter:`drop-shadow(0 0 6px ${skin.primary}88)` }}>
          <PixelChar skinId={skin.id} scale={charScale} />
        </div>

        {/* 닉네임 + 클래스 */}
        <div style={{ flex:1, minWidth:0 }}>
          {title && (
            <div style={{ fontFamily:'JetBrains Mono', fontSize:subFontSz, color:skin.secondary, letterSpacing:'0.1em', marginBottom:'0.15rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {title}
            </div>
          )}
          <div style={{ fontFamily:'Rajdhani,sans-serif', fontSize:nameFontSz, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e8eef5', textShadow:`0 0 8px ${skin.primary}66`, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {nickname || 'AGENT'}
          </div>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:subFontSz, color:`${skin.primary}99`, marginTop:'0.1rem' }}>
            {skin.class}
          </div>
        </div>
      </div>

      {/* 스탯 */}
      {(rating !== undefined || coins !== undefined) && (
        <div style={{ position:'relative', zIndex:1, borderTop:`1px solid ${skin.primary}22`, paddingTop:'0.5rem', display:'flex', justifyContent:'space-between' }}>
          {rating !== undefined && (
            <div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:subFontSz, color:`${skin.primary}77`, letterSpacing:'0.12em', textTransform:'uppercase' }}>RATING</div>
              <div style={{ fontFamily:'Rajdhani', fontSize:statFontSz, fontWeight:700, color:skin.primary }}>{rating}</div>
            </div>
          )}
          {coins !== undefined && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:subFontSz, color:`${skin.primary}77`, letterSpacing:'0.12em', textTransform:'uppercase' }}>COINS</div>
              <div style={{ fontFamily:'Rajdhani', fontSize:statFontSz, fontWeight:700, color:'#ffd700' }}>{coins.toLocaleString()}</div>
            </div>
          )}
        </div>
      )}

      {/* 코너 장식 */}
      <div style={{ position:'absolute', top:4, left:4, width:8, height:8, borderTop:`1.5px solid ${skin.primary}`, borderLeft:`1.5px solid ${skin.primary}` }} />
      <div style={{ position:'absolute', bottom:4, right:4, width:8, height:8, borderBottom:`1.5px solid ${skin.primary}`, borderRight:`1.5px solid ${skin.primary}` }} />
    </div>
  )
}
