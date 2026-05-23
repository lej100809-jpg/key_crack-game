import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import BattleRoom from '@/components/battle/BattleRoom'
import { useBattleStore } from '@/store/useBattleStore'
import { usePlayerStore } from '@/store/usePlayerStore'

type View = 'lobby' | 'matching' | 'battle' | 'result'

export default function BattleModePage() {
  const navigate    = useNavigate()
  const [view, setView]       = useState<View>('lobby')
  const [nickname, setNickname] = useState('')
  const [err, setErr]         = useState('')

  const player    = usePlayerStore(s => s.player)
  const { joinQueue, leaveRoom, room, error } = useBattleStore()

  function handleJoin() {
    const nick = nickname.trim() || player?.nickname || ''
    if (!nick) { setErr('닉네임을 입력하세요.'); return }
    setErr('')
    joinQueue(nick)
    setView('matching')
  }

  function handleLeave() {
    leaveRoom()
    setView('lobby')
  }

  /* ── 로비 ───────────────────────────────────────────── */
  if (view === 'lobby') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '6rem 1.5rem 3rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--mag)', display: 'block', marginBottom: '0.4rem' }}>
            // BATTLE MODE
          </span>
          <h1 style={{ fontFamily: 'Rajdhani', fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tx)', margin: '0 0 0.5rem' }}>
            ⚔️ <span style={{ color: 'var(--mag)' }}>PvP BATTLE</span>
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--tx2)', lineHeight: 1.8 }}>
            전 세계 플레이어와 1v1 실시간 배틀. 같은 RSA 문제를 더 빠르게 해독하는 자가 승리.
          </p>
        </div>

        {/* 배틀 규칙 */}
        <div className="hud" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div className="panel-tag">BATTLE RULES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              ['5라운드', 'Round마다 난이도 상승'],
              ['동시 시작', '같은 문제, 동시에 해독'],
              ['스킬 시스템', 'Round 3부터 스킬 활성화'],
              ['ELO 레이팅', '승패에 따라 레이팅 변동'],
            ].map(([t, d]) => (
              <div key={t} style={{ background: 'var(--bg-input)', padding: '0.75rem', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{t}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--tx2)' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 스킬 프리뷰 */}
        <div className="hud mag" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div className="panel-tag" style={{ color: 'var(--mag)' }}>SKILLS (Round 3+)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {[
              { icon: '🎭', name: '가짜 힌트', desc: '잘못된 힌트 전송', color: 'var(--mag)' },
              { icon: '⏱', name: '시간 단축', desc: '상대 -20초',        color: 'var(--warn)' },
              { icon: '🛡', name: '방어막',   desc: '스킬 1회 무효화',   color: 'var(--cyan)' },
              { icon: '💡', name: '힌트 충전', desc: '힌트 1회 회복',    color: 'var(--green)' },
            ].map(s => (
              <div key={s.name} style={{ flex: '1 1 130px', padding: '0.6rem', background: 'var(--bg-input)', border: `1px solid ${s.color}33` }}>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.name}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--tx3)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 닉네임 입력 + 참가 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <input
              type="text"
              placeholder={player?.nickname ?? 'AGENT NAME'}
              value={nickname}
              onChange={e => { setNickname(e.target.value); setErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={16}
              style={{
                padding: '0.75rem 1rem', width: 200,
                background: 'var(--bg-input)', border: '1px solid var(--mag)',
                color: 'var(--tx)', fontFamily: 'JetBrains Mono', fontSize: '0.85rem',
                outline: 'none', letterSpacing: '0.05em',
              }}
            />
            <button
              onClick={handleJoin}
              style={{ padding: '0.75rem 2.2rem', background: 'var(--mag)', color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
            >
              ▶ ENTER QUEUE
            </button>
          </div>
          {err && <div style={{ color: 'var(--mag)', fontSize: '0.72rem', marginBottom: '0.5rem' }}>⚠ {err}</div>}
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--tx2)', padding: '0.5rem 1.5rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
            ← HOME
          </button>
        </div>
      </main>
    </div>
  )

  /* ── 매칭 대기 ──────────────────────────────────────── */
  if (view === 'matching' && !room) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NavBar />
      <div style={{ textAlign: 'center' }}>
        <div className="hud" style={{ padding: '3rem 4rem' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '1.3rem', fontWeight: 700, color: 'var(--mag)', letterSpacing: '0.2em', marginBottom: '1.5rem', animation: 'blink 1.4s infinite' }}>
            ⚔️ MATCHING...
          </div>
          {/* 로딩 바 */}
          <div style={{ width: 220, height: 3, background: 'rgba(255,255,255,0.06)', margin: '0 auto 1.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--mag)', animation: 'glow-pulse 1.2s infinite', width: '60%' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--tx2)', marginBottom: '1.5rem' }}>
            상대방을 찾고 있습니다...
          </div>
          {error && <div style={{ color: 'var(--mag)', fontSize: '0.72rem', marginBottom: '1rem' }}>⚠ {error} — 서버가 실행 중인지 확인하세요.</div>}
          <button onClick={handleLeave} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--tx2)', padding: '0.5rem 1.5rem', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', cursor: 'pointer' }}>
            취소
          </button>
        </div>
      </div>
    </div>
  )

  /* ── 배틀 룸 ────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '5.5rem 1.5rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--mag)' }}>
            // BATTLE MODE — ROOM {room?.roomId?.slice(0,8).toUpperCase()}
          </span>
          <button onClick={handleLeave} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--tx3)', padding: '0.35rem 0.9rem', fontFamily: 'JetBrains Mono', fontSize: '0.65rem', cursor: 'pointer', letterSpacing: '0.1em' }}>
            나가기
          </button>
        </div>
        <BattleRoom onGameOver={() => { handleLeave(); setView('lobby') }} />
      </main>
    </div>
  )
}
