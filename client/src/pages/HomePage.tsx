import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore, selectCoins, selectEquippedSkin } from '@/store/usePlayerStore'
import NavBar from '@/components/ui/NavBar'
import AgentCard from '@/components/ui/AgentCard'
import PixelIcon from '@/components/ui/PixelIcon'
import { loginWithGoogle, loginWithGithub, isConfigured } from '@/lib/supabase'
import { useTutorialStore, selectNeedsTutorial } from '@/store/useTutorialStore'

const MODES = [
  {
    path: '/stage', icon: 'folder', title: 'STAGE MODE',
    badge: 'SINGLE PLAYER', badgeColor: 'var(--cyan)',
    desc: '20개의 스토리 스테이지. Beginner부터 Expert까지 단계별로 RSA 암호를 해독하라.',
    tags: ['20 스테이지', '힌트 시스템', '배지 획득'],
    color: 'var(--cyan)', glow: 'rgba(0,212,255,0.12)',
  },
  {
    path: '/vault', icon: 'lock', title: 'VAULT MODE',
    badge: 'CHALLENGE', badgeColor: '#ffd700',
    desc: 'Bronze → Platinum 4등급 금고 챌린지. 등급이 높을수록 더 큰 소수, 더 짧은 시간.',
    tags: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    color: '#ffd700', glow: 'rgba(255,215,0,0.12)',
  },
  {
    path: '/battle', icon: 'crossed_swords', title: 'BATTLE MODE',
    badge: 'PvP MULTIPLAYER', badgeColor: 'var(--mag)',
    desc: '1v1 실시간 배틀. 같은 문제를 누가 먼저 해독하나. 스킬로 상대를 방해하라.',
    tags: ['5라운드', '스킬 시스템', 'ELO 레이팅'],
    color: 'var(--mag)', glow: 'rgba(255,45,120,0.12)',
  },
  {
    path: '/learn', icon: 'book', title: 'LEARN RSA',
    badge: 'TUTORIAL', badgeColor: 'var(--green)',
    desc: 'RSA 암호의 수학적 원리를 인터랙티브하게 학습. 슬라이더로 p·q를 조작해보자.',
    tags: ['인터랙티브', '소수 테이블', '공식 가이드'],
    color: 'var(--green)', glow: 'rgba(0,255,136,0.12)',
  },
]

export default function HomePage() {
  const navigate    = useNavigate()
  const player      = usePlayerStore(s => s.player)
  const initPlayer  = usePlayerStore(s => s.initPlayer)
  const equippedSkin = usePlayerStore(selectEquippedSkin)
  const coins        = usePlayerStore(selectCoins)
  const equippedTitle = usePlayerStore(s => s.equippedTitle)
  const canvasRef   = useRef<HTMLCanvasElement>(null)

  /* 배경 캔버스 (랜딩 페이지와 동일 네트워크 애니메이션) */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      team: Math.random() > .5 ? 'cyan' : 'mag',
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(0,212,255,0.025)'
      for (let x = 0; x < canvas.width; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
        const c = n.team === 'cyan' ? '0,212,255' : '255,45,120'
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.5, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${c},0.7)`; ctx.fill()
      })

      nodes.forEach((a, i) => nodes.slice(i+1).forEach(b => {
        const d = Math.hypot(a.x-b.x, a.y-b.y)
        if (d < 140) {
          const alpha = (1 - d/140) * .14
          const c = a.team===b.team ? (a.team==='cyan'?'0,212,255':'255,45,120') : '100,80,160'
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
          ctx.strokeStyle = `rgba(${c},${alpha})`; ctx.lineWidth=0.5; ctx.stroke()
        }
      }))
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const [authLoading, setAuthLoading] = useState(false)
  const [authErr,     setAuthErr]     = useState('')

  async function handleSocialLogin(provider: 'google' | 'github') {
    setAuthLoading(true); setAuthErr('')
    try {
      if (!isConfigured) { setAuthErr('Supabase 미설정 — .env.local을 확인하세요.'); setAuthLoading(false); return }
      // Supabase OAuth → 페이지 리다이렉트 (팝업 아님)
      if (provider === 'google') await loginWithGoogle()
      else                        await loginWithGithub()
      // 리다이렉트 후 App.tsx의 onAuthChange에서 자동 처리됨
    } catch (e: unknown) {
      setAuthErr(e instanceof Error ? e.message : '로그인 실패')
      setAuthLoading(false)
    }
  }

  const needsTutorial = useTutorialStore(selectNeedsTutorial)

  function enterAsGuest() {
    initPlayer('guest-' + Date.now(), 'AGENT_' + Math.floor(Math.random()*9999))
    navigate(needsTutorial ? '/tutorial' : '/stage')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.055) 3px,rgba(0,0,0,0.055) 4px)' }} />

      <NavBar />

      <main style={{ position: 'relative', zIndex: 2, paddingTop: '5rem' }}>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1.5rem' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 8px var(--green)', display:'inline-block', animation:'blink 1.4s infinite' }} />
            SYSTEM ONLINE — RSA BREACH PROTOCOL ACTIVE
          </div>

          <h1 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(4rem,10vw,8rem)', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 0.9, textTransform: 'uppercase', margin: 0 }}>
            <span style={{ color: 'var(--cyan)', textShadow: '0 0 50px rgba(0,212,255,.4)' }}>KEY</span>
            <br />
            <span style={{ color: 'var(--mag)', textShadow: '0 0 50px rgba(255,45,120,.4)' }}>CRACK</span>
          </h1>

          <p style={{ fontFamily: 'Rajdhani', fontSize: '1rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--tx2)', margin: '1rem 0 2rem' }}>
            // RSA DECRYPTION BATTLE //
          </p>

          {/* 플레이어 상태 or 로그인 */}
          {player ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1.25rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
              <AgentCard
                skin={equippedSkin}
                nickname={player.nickname}
                title={equippedTitle ? equippedTitle.replace('title_','').toUpperCase() : undefined}
                rating={player.rating}
                coins={coins}
                size="md"
                selected
              />
              <button
                onClick={() => navigate('/shop')}
                style={{ padding:'0.75rem 1.5rem', background:'transparent', border:`1px solid ${equippedSkin.primary}`, color:equippedSkin.primary, fontFamily:'Rajdhani', fontSize:'0.9rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${equippedSkin.primary}22` }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                🛒 AGENT STORE
              </button>
            </div>
          ) : (
            <div style={{ marginBottom:'2.5rem', textAlign:'center' }}>
              {/* 소셜 로그인 */}
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={authLoading}
                  style={{ padding:'0.75rem 1.6rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.2)', color:'var(--tx)', fontFamily:'JetBrains Mono', fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.6rem', transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  <svg viewBox="0 0 24 24" fill="none" style={{ width:18, height:18, flexShrink:0 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google 로그인
                </button>
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={authLoading}
                  style={{ padding:'0.75rem 1.6rem', background:'rgba(110,118,129,0.1)', border:'1px solid rgba(110,118,129,0.3)', color:'var(--tx)', fontFamily:'JetBrains Mono', fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.6rem', transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(110,118,129,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(110,118,129,0.1)')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width:18, height:18, flexShrink:0 }}>
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub 로그인
                </button>
              </div>

              {authErr && <div style={{ fontSize:'0.7rem', color:'var(--mag)', marginBottom:'0.5rem' }}>⚠ {authErr}</div>}

              {/* 구분선 */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', justifyContent:'center', marginBottom:'0.75rem', maxWidth:360, margin:'0 auto 0.75rem' }}>
                <div style={{ flex:1, height:1, background:'var(--border)' }} />
                <span style={{ fontSize:'0.62rem', color:'var(--tx3)', letterSpacing:'0.15em' }}>OR</span>
                <div style={{ flex:1, height:1, background:'var(--border)' }} />
              </div>

              {/* 게스트 + 학습 */}
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={enterAsGuest} style={{ padding:'0.75rem 2rem', background:'var(--cyan)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                  ▶ QUICK START
                </button>
                <button onClick={() => navigate('/learn')} style={{ padding:'0.75rem 1.75rem', background:'transparent', color:'var(--mag)', border:'1px solid var(--mag)', fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                  LEARN RSA
                </button>
              </div>
            </div>
          )}

          {/* 통계 칩 */}
          <div style={{ display:'flex', gap:'2rem', justifyContent:'center', flexWrap:'wrap' }}>
            {[['20','스테이지'],['4','게임 모드'],['5','난이도'],['실시간','배틀 PvP']].map(([v,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, color:'var(--cyan)', lineHeight:1, textShadow:'0 0 12px var(--cyan-dim)' }}>{v}</div>
                <div style={{ fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--tx3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MODE CARDS ────────────────────────────────────────── */}
        <section style={{ padding: '2rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <span style={{ fontSize:'0.62rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cyan)', display:'block', marginBottom:'0.4rem' }}>// SELECT OPERATION</span>
            <h2 style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.6rem,3.5vw,2.4rem)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
              게임 <span style={{ color:'var(--cyan)' }}>모드</span>
            </h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.25rem' }}>
            {MODES.map(m => (
              <button
                key={m.path}
                onClick={() => navigate(m.path)}
                style={{
                  background:'var(--bg-card)', border:`1px solid rgba(255,255,255,0.08)`,
                  padding:'1.75rem', cursor:'pointer', textAlign:'left',
                  transition:'all 0.3s', position:'relative', overflow:'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = m.color
                  e.currentTarget.style.boxShadow = `0 8px 30px ${m.glow}`
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize:'0.58rem', letterSpacing:'0.2em', textTransform:'uppercase', padding:'0.15rem 0.5rem', border:`1px solid ${m.badgeColor}`, color:m.badgeColor, display:'inline-block', marginBottom:'1.25rem' }}>
                  {m.badge}
                </span>
                <div style={{ marginBottom:'0.75rem' }}>
                  <PixelIcon name={m.icon} scale={5} color={m.color} />
                </div>
                <div style={{ fontFamily:'Rajdhani', fontSize:'1.25rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', marginBottom:'0.5rem' }}>{m.title}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--tx2)', lineHeight:1.75, marginBottom:'1rem' }}>{m.desc}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
                  {m.tags.map(t => (
                    <span key={t} style={{ fontSize:'0.58rem', padding:'0.12rem 0.45rem', background:`${m.glow}`, border:`1px solid ${m.color}33`, color:m.color, letterSpacing:'0.08em' }}>{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
