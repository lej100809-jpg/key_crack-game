import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import PuzzleBoard from '@/components/puzzle/PuzzleBoard'
import VaultSelector from '@/components/vault/VaultSelector'
import VaultDoor from '@/components/vault/VaultDoor'
import { usePlayerStore } from '@/store/usePlayerStore'
import { usePuzzleStore } from '@/store/usePuzzleStore'
import { VAULT_CONFIG } from '@/types'
import type { VaultGrade } from '@/types'
import { calcVaultScore } from '@/data/rankSystem'

const GRADE_STYLE: Record<VaultGrade, { color: string; glow: string; icon: string }> = {
  bronze:   { color: '#cd7f32', glow: 'rgba(205,127,50,0.18)',  icon: '🥉' },
  silver:   { color: '#c0c0c0', glow: 'rgba(192,192,192,0.18)', icon: '🥈' },
  gold:     { color: '#ffd700', glow: 'rgba(255,215,0,0.18)',   icon: '🥇' },
  platinum: { color: '#e5e4e2', glow: 'rgba(229,228,226,0.18)', icon: '💎' },
}

type View = 'select' | 'intro' | 'play' | 'clear' | 'fail'

export default function VaultModePage() {
  const navigate  = useNavigate()
  const [view,  setView]  = useState<View>('select')
  const [grade, setGrade] = useState<VaultGrade | null>(null)
  const [doorState, setDoorState] = useState<'locked'|'unlocking'|'open'|'failed'>('locked')
  const [result, setResult] = useState<{ timeSec: number; rp: number } | null>(null)
  const addCoins      = usePlayerStore(s => s.addCoins)
  const addRankPoints = usePlayerStore(s => s.addRankPoints)

  function startVault(g: VaultGrade) {
    usePuzzleStore.getState().resetPuzzle()   // 이전 status 초기화
    setGrade(g); setDoorState('locked'); setView('intro')
    setTimeout(() => setDoorState('unlocking'), 700)
  }

  function onSolve(timeSec: number) {
    if (!grade) return
    addCoins(VAULT_CONFIG[grade].rewardCoins)
    const cfg = VAULT_CONFIG[grade]
    const rp = calcVaultScore({ grade, timeLimitSec: cfg.timeLimitSec, timeTaken: timeSec })
    addRankPoints(rp, { source: 'vault', label: `${cfg.label} Vault`, rp })
    setResult({ timeSec, rp }); setView('clear')
  }

  /* ── 등급 선택 ──────────────────────────────────────── */
  if (view === 'select') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth:'1020px', margin:'0 auto', padding:'6rem 1.5rem 3rem' }}>
        <VaultSelector onSelect={startVault} />
        <div style={{ textAlign:'center', marginTop:'2rem' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--tx2)', padding:'0.5rem 1.5rem', fontFamily:'JetBrains Mono', fontSize:'0.72rem', cursor:'pointer', letterSpacing:'0.1em' }}>
            ← HOME
          </button>
        </div>
      </main>
    </div>
  )

  /* ── 금고 문 인트로 ─────────────────────────────────── */
  if (view === 'intro' && grade) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <NavBar />
      <div style={{ textAlign:'center' }}>
        <VaultDoor
          grade={grade}
          state={doorState}
          onOpenEnd={() => { setView('play') }}
        />
        <div style={{ marginTop:'1.5rem', fontFamily:'JetBrains Mono', fontSize:'0.72rem', color:'var(--tx3)', letterSpacing:'0.15em' }}>
          {doorState === 'unlocking' ? '금고를 해제하는 중...' : '잠금 확인 중...'}
        </div>
      </div>
    </div>
  )

  /* ── 플레이 ─────────────────────────────────────────── */
  if (view === 'play' && grade) {
    const cfg = VAULT_CONFIG[grade]
    const st  = GRADE_STYLE[grade]
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
        <NavBar />
        <main style={{ maxWidth:'960px', margin:'0 auto', padding:'5.5rem 1.5rem 3rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
            <div>
              <span style={{ fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:st.color }}>
                {st.icon} {cfg.label.toUpperCase()} VAULT
              </span>
              <h2 style={{ fontFamily:'Rajdhani', fontSize:'1.5rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:'0.2rem 0 0' }}>
                금고 해독 챌린지
              </h2>
            </div>
            <button onClick={() => setView('select')} style={{ background:'transparent', border:`1px solid ${st.color}`, color:st.color, padding:'0.4rem 1rem', fontFamily:'JetBrains Mono', fontSize:'0.68rem', cursor:'pointer', letterSpacing:'0.1em' }}>
              ← 등급 선택
            </button>
          </div>

          {cfg.isChained && (
            <div style={{ fontSize:'0.75rem', color:st.color, borderLeft:`2px solid ${st.color}`, paddingLeft:'0.75rem', marginBottom:'1.25rem', fontStyle:'italic' }}>
              ⛓ Platinum 챌린지: 첫 번째 복호화 결과가 두 번째 문제의 메시지입니다.
            </div>
          )}

          <PuzzleBoard
            difficulty={grade === 'bronze' ? 'easy' : grade === 'silver' ? 'medium' : grade === 'gold' ? 'hard' : 'expert'}
            onSolve={onSolve}
            onFail={() => setView('fail')}
            onReset={() => setView('select')}
          />
        </main>
      </div>
    )
  }

  /* ── 클리어 ─────────────────────────────────────────── */
  if (view === 'clear' && grade && result) {
    const cfg = VAULT_CONFIG[grade]
    const st  = GRADE_STYLE[grade]
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <NavBar />
        <div style={{ textAlign:'center', padding:'2rem' }}>
          <div style={{ background:'var(--bg-panel)', border:`1px solid ${st.color}55`, padding:'3rem', maxWidth:420, boxShadow:`0 0 40px ${st.glow}` }}>
            <div style={{ fontSize:'4rem', marginBottom:'0.5rem' }}>{st.icon}</div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, letterSpacing:'0.2em', color:st.color, marginBottom:'0.5rem' }}>
              VAULT CRACKED
            </div>
            <div style={{ color:'var(--tx2)', fontSize:'0.78rem', marginBottom:'2rem' }}>{cfg.label} 금고 해독 성공</div>
            <div style={{ display:'flex', gap:'2rem', justifyContent:'center', marginBottom:'2rem' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.25rem' }}>COINS</div>
                <div style={{ fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, color:'var(--green)' }}>+{cfg.rewardCoins.toLocaleString()}</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.25rem' }}>RP</div>
                <div style={{ fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, color:'#aa88ff', textShadow:'0 0 12px #aa88ff88' }}>+{result.rp.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => setView('select')} style={{ padding:'0.7rem 1.75rem', background:st.color, color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                다른 금고 도전
              </button>
              <button onClick={() => navigate('/')} style={{ padding:'0.7rem 1.25rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', fontSize:'0.9rem', cursor:'pointer' }}>
                HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── 실패 ────────────────────────────────────────────── */
  if (view === 'fail') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <NavBar />
      <div style={{ textAlign:'center', padding:'2rem' }}>
        <div style={{ background:'var(--bg-panel)', border:'1px solid rgba(255,45,120,0.4)', padding:'3rem', maxWidth:380 }}>
          <div style={{ fontFamily:'Rajdhani', fontSize:'2rem', fontWeight:700, color:'var(--mag)', marginBottom:'1rem' }}>⏱ TIME EXPIRED</div>
          <p style={{ color:'var(--tx2)', fontSize:'0.78rem', marginBottom:'2rem' }}>금고를 제시간에 열지 못했습니다.</p>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
            {grade && <button onClick={() => startVault(grade)} style={{ padding:'0.65rem 1.5rem', background:'var(--mag)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.9rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>재도전</button>}
            <button onClick={() => setView('select')} style={{ padding:'0.65rem 1.25rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', cursor:'pointer' }}>등급 선택</button>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}
