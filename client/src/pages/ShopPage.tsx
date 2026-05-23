import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import AgentCard from '@/components/ui/AgentCard'
import PixelChar from '@/components/ui/PixelChar'
import PixelIcon from '@/components/ui/PixelIcon'
import { usePlayerStore, selectCoins } from '@/store/usePlayerStore'
import { AGENT_SKINS, TITLES, CONSUMABLES, CHALLENGES, getSkin } from '@/data/shopItems'

type Tab = 'skin' | 'title' | 'consumable' | 'challenge'

const TAB_ICON: Record<Tab, string> = { skin:'gamepad', title:'medal', consumable:'pill', challenge:'bolt' }
const TAB_TEXT: Record<Tab, string> = { skin:'에이전트 스킨', title:'칭호', consumable:'소모품', challenge:'특수 도전' }

export default function ShopPage() {
  const navigate      = useNavigate()
  const [tab, setTab] = useState<Tab>('skin')
  const [preview, setPreview] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const coins         = usePlayerStore(selectCoins)
  const player        = usePlayerStore(s => s.player)
  const ownedSkins    = usePlayerStore(s => s.ownedSkins)
  const ownedTitles   = usePlayerStore(s => s.ownedTitles)
  const ownedChallenges = usePlayerStore(s => s.ownedChallenges)
  const equippedSkin  = usePlayerStore(s => s.equippedSkin)
  const equippedTitle = usePlayerStore(s => s.equippedTitle)
  const inventory     = usePlayerStore(s => s.inventory)
  const { buyItem, equipSkin, equipTitle, unequipTitle } = usePlayerStore()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  function handleBuy(id: string, price: number, category: string, value = 1) {
    if (!player) { showToast('로그인 후 이용하세요.'); return }
    if (coins < price) { showToast(`코인 부족! ${price - coins}코인 더 필요합니다.`); return }
    const ok = buyItem(id, price, category, value)
    if (ok) showToast('구매 완료! 💰')
  }

  const cardBtn = (label: string, onClick: () => void, color: string, disabled = false) => (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        padding: '0.4rem 0.9rem', background: disabled ? 'rgba(255,255,255,0.04)' : `${color}18`,
        border: `1px solid ${disabled ? 'var(--tx3)' : color}`,
        color: disabled ? 'var(--tx3)' : color,
        fontFamily: 'Rajdhani', fontSize: '0.8rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = `${color}33`)}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = `${color}18`)}
    >
      {label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />

      {/* 토스트 */}
      {toast && (
        <div style={{
          position:'fixed', top:72, left:'50%', transform:'translateX(-50%)',
          background:'var(--bg-panel)', border:'1px solid var(--green)',
          color:'var(--green)', padding:'0.6rem 1.5rem',
          fontFamily:'JetBrains Mono', fontSize:'0.8rem', letterSpacing:'0.1em',
          zIndex:200, boxShadow:'0 4px 20px rgba(0,255,136,0.2)',
          animation:'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'5.5rem 1.5rem 3rem' }}>

        {/* 헤더 */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
          <div>
            <span style={{ fontSize:'0.62rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cyan)', display:'block', marginBottom:'0.3rem' }}>// AGENT STORE</span>
            <h1 style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
              상점
            </h1>
          </div>
          {/* 코인 + 인벤 */}
          <div className="hud" style={{ padding:'0.75rem 1.25rem', display:'flex', gap:'1.5rem', alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>COINS</div>
              <div style={{ fontFamily:'Rajdhani', fontSize:'1.4rem', fontWeight:700, color:'#ffd700' }}>{coins.toLocaleString()}</div>
            </div>
            <div style={{ width:1, height:36, background:'var(--border)' }} />
            <div style={{ fontSize:'0.7rem', color:'var(--tx2)', display:'flex', flexDirection:'column', gap:'0.15rem' }}>
              <span>💡 힌트 ×{inventory.hints}</span>
              <span>⏳ 시간연장 ×{inventory.timeExtends}</span>
              <span>💎 부활권 ×{inventory.revives}</span>
            </div>
          </div>
        </div>

        {/* 현재 장착 에이전트 카드 */}
        <div style={{ marginBottom:'2rem', display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap' }}>
          <AgentCard
            skin={getSkin(equippedSkin)}
            nickname={player?.nickname ?? 'AGENT'}
            title={equippedTitle ? equippedTitle.replace('title_','').toUpperCase() : undefined}
            rating={player?.rating} coins={coins}
            size="md" selected
          />
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', letterSpacing:'0.2em', color:'var(--tx3)', textTransform:'uppercase', marginBottom:'0.5rem' }}>현재 장착</div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700, color:'var(--tx)', marginBottom:'0.25rem' }}>{getSkin(equippedSkin).name} 스킨</div>
            {equippedTitle
              ? <div style={{ fontSize:'0.78rem', color:'var(--cyan)', marginBottom:'0.75rem' }}>칭호: {equippedTitle.replace('title_','').toUpperCase()}</div>
              : <div style={{ fontSize:'0.75rem', color:'var(--tx3)', marginBottom:'0.75rem' }}>칭호 없음</div>
            }
            {equippedTitle && cardBtn('칭호 해제', unequipTitle, 'var(--tx3)')}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'0' }}>
          {(Object.keys(TAB_ICON) as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding:'0.6rem 1.1rem', background:'none', border:'none',
              borderBottom: tab===t ? '2px solid var(--cyan)' : '2px solid transparent',
              color: tab===t ? 'var(--cyan)' : 'var(--tx2)',
              fontFamily:'JetBrains Mono', fontSize:'0.72rem', letterSpacing:'0.1em', cursor:'pointer',
              transition:'color 0.2s', whiteSpace:'nowrap',
              display:'flex', alignItems:'center', gap:'0.4rem',
            }}>
              <PixelIcon name={TAB_ICON[t]} scale={2} color={tab===t ? 'var(--cyan)' : '#7a90a8'} />
              {TAB_TEXT[t]}
            </button>
          ))}
        </div>

        {/* ── 스킨 탭 ──────────────────────────────────────── */}
        {tab === 'skin' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem' }}>
            {AGENT_SKINS.map(skin => {
              const owned    = ownedSkins.includes(skin.id)
              const equipped = equippedSkin === skin.id
              const hov      = preview === skin.id
              return (
                <div
                  key={skin.id}
                  onMouseEnter={() => setPreview(skin.id)}
                  onMouseLeave={() => setPreview(null)}
                  style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}
                >
                  <div style={{ position:'relative' }}>
                    <AgentCard
                      skin={skin}
                      nickname={player?.nickname ?? 'AGENT'}
                      size="sm"
                      selected={equipped}
                      onClick={owned ? () => { equipSkin(skin.id); showToast(`${skin.name} 장착 완료!`) } : undefined}
                    />
                    {/* 픽셀 캐릭터 확대 미리보기 */}
                    {hov && !owned && (
                      <div style={{
                        position:'absolute', top:-10, left:'105%', zIndex:30,
                        background:'var(--bg-panel)', border:`1px solid ${skin.primary}`,
                        padding:'0.75rem', boxShadow:`0 8px 24px ${skin.glowColor}`,
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'0.4rem',
                        whiteSpace:'nowrap',
                      }}>
                        <PixelChar skinId={skin.id} scale={5} />
                        <div style={{ fontFamily:'Rajdhani', fontSize:'0.8rem', color:skin.primary, letterSpacing:'0.15em' }}>{skin.name}</div>
                        <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.6rem', color:'var(--tx3)' }}>{skin.class}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                    {owned ? (
                      equipped
                        ? <span style={{ fontSize:'0.65rem', color:'var(--green)', fontFamily:'JetBrains Mono' }}>✓ 장착 중</span>
                        : cardBtn('장착', () => { equipSkin(skin.id); showToast(`${skin.name} 장착 완료!`) }, skin.primary)
                    ) : skin.free ? (
                      cardBtn('무료 받기', () => handleBuy(skin.id, 0, 'skin'), 'var(--green)')
                    ) : (
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        <span style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color: coins >= skin.price ? '#ffd700' : 'var(--mag)' }}>
                          💰 {skin.price.toLocaleString()}
                        </span>
                        {cardBtn('구매', () => handleBuy(skin.id, skin.price, 'skin'), skin.primary, coins < skin.price)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 칭호 탭 ──────────────────────────────────────── */}
        {tab === 'title' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'0.75rem' }}>
            {TITLES.map(item => {
              const owned    = ownedTitles.includes(item.id)
              const equipped = equippedTitle === item.id
              return (
                <div key={item.id} className="hud" style={{ padding:'1rem', display:'flex', gap:'0.75rem', alignItems:'center', justifyContent:'space-between', border:`1px solid ${equipped ? 'var(--cyan)' : 'var(--border)'}` }}>
                  <div>
                    <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:'var(--cyan)', letterSpacing:'0.12em', marginBottom:'0.2rem' }}>
                      {item.icon} {item.name}
                    </div>
                    <div style={{ fontSize:'0.68rem', color:'var(--tx2)', lineHeight:1.5 }}>{item.desc}</div>
                    {!owned && <div style={{ fontSize:'0.68rem', color: coins>=item.price?'#ffd700':'var(--mag)', marginTop:'0.3rem' }}>💰 {item.price}</div>}
                  </div>
                  <div style={{ flexShrink:0 }}>
                    {owned
                      ? equipped
                        ? cardBtn('장착 중', unequipTitle, 'var(--green)')
                        : cardBtn('장착', () => { equipTitle(item.id); showToast(`${item.name} 칭호 장착!`) }, 'var(--cyan)')
                      : cardBtn('구매', () => handleBuy(item.id, item.price, 'title'), 'var(--cyan)', coins < item.price)
                    }
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── 소모품 탭 ─────────────────────────────────────── */}
        {tab === 'consumable' && (
          <div>
            <div style={{ padding:'0.75rem 1rem', background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', fontSize:'0.75rem', color:'var(--tx2)', marginBottom:'1.5rem' }}>
              💡 소모품은 스테이지·볼트 플레이 중 PuzzleBoard 상단 툴바에서 사용합니다.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
              {CONSUMABLES.map(item => (
                <div key={item.id} className="hud" style={{ padding:'1.25rem' }}>
                  <div style={{ marginBottom:'0.5rem' }}>
                    <PixelIcon name={
                      item.id === 'hint_x1' || item.id === 'hint_x3' ? 'bulb'
                      : item.id === 'time_extend' ? 'hourglass'
                      : 'diamond'
                    } scale={4} />
                  </div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:'var(--green)', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>{item.name}</div>
                  <div style={{ fontSize:'0.73rem', color:'var(--tx2)', lineHeight:1.7, marginBottom:'0.75rem' }}>{item.desc}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <span style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700, color: coins>=item.price?'#ffd700':'var(--mag)' }}>💰 {item.price}</span>
                    </div>
                    {cardBtn('구매', () => handleBuy(item.id, item.price, 'consumable', item.value ?? 1), 'var(--green)', coins < item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 특수 도전 탭 ─────────────────────────────────── */}
        {tab === 'challenge' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {CHALLENGES.map(item => {
              const owned = ownedChallenges.includes(item.id)
              return (
                <div key={item.id} className="hud" style={{ padding:'1.5rem', border:`1px solid ${owned ? 'var(--mag)' : 'var(--border)'}` }}>
                  <div style={{ marginBottom:'0.75rem' }}>
                    <PixelIcon name={
                      item.id === 'challenge_speed' ? 'bolt'
                      : item.id === 'challenge_blind' ? 'blind'
                      : 'skull'
                    } scale={5} />
                  </div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700, color:'var(--mag)', letterSpacing:'0.1em', marginBottom:'0.35rem', textTransform:'uppercase' }}>{item.name}</div>
                  <div style={{ fontSize:'0.73rem', color:'var(--tx2)', lineHeight:1.75, marginBottom:'1rem' }}>{item.desc}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700, color: owned?'var(--green)': coins>=item.price?'#ffd700':'var(--tx3)' }}>
                      {owned ? '✓ 보유 중' : `💰 ${item.price.toLocaleString()}`}
                    </span>
                    {!owned && cardBtn('해금', () => handleBuy(item.id, item.price, 'challenge'), 'var(--mag)', coins < item.price)}
                    {owned && cardBtn('도전', () => navigate('/challenge', { state: { type: item.id.replace('challenge_', '') } }), 'var(--green)')}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop:'2rem', textAlign:'center' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--tx2)', padding:'0.5rem 1.5rem', fontFamily:'JetBrains Mono', fontSize:'0.72rem', cursor:'pointer', letterSpacing:'0.1em' }}>
            ← HOME
          </button>
        </div>
      </main>
    </div>
  )
}
