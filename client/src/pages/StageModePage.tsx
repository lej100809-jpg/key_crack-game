import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import PuzzleBoard from '@/components/puzzle/PuzzleBoard'
import { usePlayerStore } from '@/store/usePlayerStore'
import { usePuzzleStore } from '@/store/usePuzzleStore'
import { STAGES, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/data/stages'
import { calcStageScore } from '@/data/rankSystem'
import type { Stage } from '@/types'

type View = 'select' | 'play' | 'clear'

export default function StageModePage() {
  const navigate   = useNavigate()
  const [view, setView]     = useState<View>('select')
  const [stage, setStage]   = useState<Stage | null>(null)
  const [result, setResult] = useState<{ timeSec: number; hintsUsed: number; rp: number } | null>(null)
  const addCoins      = usePlayerStore(s => s.addCoins)
  const addBadge      = usePlayerStore(s => s.addBadge)
  const addRankPoints = usePlayerStore(s => s.addRankPoints)

  function startStage(s: Stage) {
    // PuzzleBoard 마운트 전 퍼즐 스토어 초기화
    // status='success'가 남아 있으면 [status] useEffect가 즉시 onSolve를 재호출하는 버그 방지
    usePuzzleStore.getState().resetPuzzle()
    setStage(s)
    setView('play')
    setResult(null)
  }

  function onSolve(timeSec: number, hintsUsed: number) {
    if (!stage) return
    addCoins(stage.rewards.coins)
    if (stage.rewards.badge) addBadge(stage.rewards.badge)
    const rp = calcStageScore({ difficulty: stage.difficulty, timeLimitSec: stage.timeLimitSec, timeTaken: timeSec, hintsUsed })
    addRankPoints(rp, { source: 'stage', label: `Stage ${stage.id} · ${stage.difficulty.toUpperCase()}`, rp })
    setResult({ timeSec, hintsUsed, rp })
    setView('clear')
  }

  /* ── 스테이지 선택 화면 ─────────────────────────────── */
  if (view === 'select') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth:'1000px', margin:'0 auto', padding:'6rem 1.5rem 3rem' }}>
        <div style={{ marginBottom:'2.5rem' }}>
          <span style={{ fontSize:'0.62rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cyan)', display:'block', marginBottom:'0.4rem' }}>// STAGE MODE</span>
          <h1 style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
            미션 <span style={{ color:'var(--cyan)' }}>선택</span>
          </h1>
        </div>

        {/* 스테이지 그리드 */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:'0.75rem' }}>
          {STAGES.map(s => {
            const c = DIFFICULTY_COLOR[s.difficulty]
            return (
              <button
                key={s.id}
                onClick={() => startStage(s)}
                style={{
                  background:'var(--bg-card)', border:`1px solid rgba(255,255,255,0.07)`,
                  padding:'1.1rem', textAlign:'left', cursor:'pointer', transition:'all 0.25s',
                  position:'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=c; e.currentTarget.style.boxShadow=`0 0 18px ${c}22`; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)' }}
              >
                <div style={{ position:'absolute', top:0, left:0, width:'2px', height:'100%', background:c }} />
                <div style={{ paddingLeft:'0.5rem' }}>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:c, marginBottom:'0.3rem' }}>
                    {DIFFICULTY_LABEL[s.difficulty]}
                  </div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--tx)', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>
                    {String(s.id).padStart(2,'0')}. {s.title}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.62rem', color:'var(--tx3)' }}>
                    <span>💰 {s.rewards.coins}</span>
                    <span>{s.timeLimitSec ? `⏱ ${s.timeLimitSec}s` : '∞'}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop:'2rem', textAlign:'center' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--tx2)', padding:'0.5rem 1.5rem', fontFamily:'JetBrains Mono', fontSize:'0.72rem', cursor:'pointer', letterSpacing:'0.1em' }}>
            ← HOME
          </button>
        </div>
      </main>
    </div>
  )

  /* ── 퍼즐 플레이 화면 ──────────────────────────────── */
  if (view === 'play' && stage) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth:'960px', margin:'0 auto', padding:'5.5rem 1.5rem 3rem' }}>

        {/* 스테이지 헤더 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <div>
            <span style={{ fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:DIFFICULTY_COLOR[stage.difficulty] }}>
              STAGE {String(stage.id).padStart(2,'0')} — {DIFFICULTY_LABEL[stage.difficulty]}
            </span>
            <h2 style={{ fontFamily:'Rajdhani', fontSize:'1.5rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:'0.2rem 0 0' }}>
              {stage.title}
            </h2>
          </div>
          <button onClick={() => setView('select')} style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--tx2)', padding:'0.4rem 1rem', fontFamily:'JetBrains Mono', fontSize:'0.68rem', cursor:'pointer', letterSpacing:'0.1em' }}>
            ← 스테이지 선택
          </button>
        </div>

        {/* 스토리 텍스트 */}
        <div style={{ fontSize:'0.78rem', color:'var(--tx2)', borderLeft:'2px solid var(--mag)', paddingLeft:'0.75rem', marginBottom:'1.5rem', lineHeight:1.7, fontStyle:'italic' }}>
          "{stage.storyText}"
        </div>

        <PuzzleBoard
          difficulty={stage.difficulty}
          onSolve={onSolve}
          onFail={() => setView('select')}
          onReset={() => setView('select')}
        />
      </main>
    </div>
  )

  /* ── 클리어 화면 ────────────────────────────────────── */
  if (view === 'clear' && stage && result) {
    const nextStage = STAGES.find(s => s.id === stage.id + 1)
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <NavBar />
        <div style={{ textAlign:'center', padding:'3rem 2rem' }}>

          {/* 성공 패널 */}
          <div style={{ background:'var(--bg-panel)', border:'1px solid rgba(0,255,136,0.4)', padding:'3rem 3.5rem', maxWidth:480, boxShadow:'0 0 40px rgba(0,255,136,0.1)' }}>
            <div style={{ fontFamily:'Rajdhani', fontSize:'2.5rem', fontWeight:700, letterSpacing:'0.25em', color:'var(--green)', textShadow:'0 0 20px var(--green)', marginBottom:'0.5rem' }}>
              🔓 MISSION CLEAR
            </div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', color:'var(--tx2)', letterSpacing:'0.15em', marginBottom:'2rem' }}>
              STAGE {String(stage.id).padStart(2,'0')} — {stage.title}
            </div>

            {/* 결과 */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.5rem' }}>
              {[
                ['TIME',  `${Math.floor(result.timeSec/60)}:${String(result.timeSec%60).padStart(2,'0')}`, 'var(--cyan)'],
                ['HINTS', String(result.hintsUsed),          'var(--warn)'],
                ['COINS', `+${stage.rewards.coins}`,         'var(--green)'],
                ['RP',    `+${result.rp}`,                   '#aa88ff'],
              ].map(([l,v,c]) => (
                <div key={l}>
                  <div style={{ fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.2rem' }}>{l}</div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1.4rem', fontWeight:700, color:c as string, textShadow: l==='RP' ? `0 0 10px ${c}` : 'none' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* RP 티어 힌트 */}
            <div style={{ fontSize:'0.65rem', color:'#aa88ff', marginBottom:'1.5rem', fontFamily:'JetBrains Mono', letterSpacing:'0.08em' }}>
              ▶ 랭킹 포인트 누적 중 — /ranking 에서 확인
            </div>

            {stage.rewards.badge && (
              <div style={{ marginBottom:'1.5rem', padding:'0.5rem 1rem', border:'1px solid var(--warn)', color:'var(--warn)', fontSize:'0.72rem', letterSpacing:'0.15em', display:'inline-block' }}>
                🏅 배지 획득: {stage.rewards.badge}
              </div>
            )}

            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              {nextStage && (
                <button onClick={() => startStage(nextStage)} style={{ padding:'0.75rem 1.75rem', background:'var(--cyan)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                  다음 스테이지 ▶
                </button>
              )}
              <button onClick={() => startStage(stage)} style={{ padding:'0.75rem 1.5rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', fontSize:'0.9rem', cursor:'pointer' }}>
                재도전
              </button>
              <button onClick={() => setView('select')} style={{ padding:'0.75rem 1.5rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', fontSize:'0.9rem', cursor:'pointer' }}>
                목록
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
