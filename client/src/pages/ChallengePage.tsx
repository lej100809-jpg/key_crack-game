import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import PuzzleBoard from '@/components/puzzle/PuzzleBoard'
import { usePlayerStore } from '@/store/usePlayerStore'
import { usePuzzleStore } from '@/store/usePuzzleStore'
import type { Difficulty } from '@/types'

// ─── 챌린지 타입 ──────────────────────────────────────────────────────────────

type ChallengeType = 'speed' | 'blind' | 'nightmare'
type View = 'intro' | 'play' | 'clear' | 'fail'

interface ChallengeConfig {
  title:            string
  subtitle:         string
  color:            string
  icon:             string
  story:            string[]
  difficulty:       Difficulty
  timeLimitOverride?: number | null  // undefined = 난이도 기본값 사용
  blindMode:        boolean
  totalRounds:      number
  rewardCoins:      number
  rewardRP:         number
  failMsg:          string
}

const CONFIGS: Record<ChallengeType, ChallengeConfig> = {
  speed: {
    title:    'SPEED RUN VAULT',
    subtitle: 'OPERATION: 45',
    color:    '#ff8800',
    icon:     '⚡',
    story: [
      '// BREACH PROTOCOL INITIATED',
      '적의 핵 발사 시퀀스가 RSA 암호로 봉인됐습니다.',
      '위성 통신 창: 정확히 45초.',
      '그 이후엔 영구 봉인. 힌트 없음. 실패 없음.',
      '▶ 지금 당장 시작하세요.',
    ],
    difficulty:       'expert',
    timeLimitOverride: 45,
    blindMode:        false,
    totalRounds:      1,
    rewardCoins:      1500,
    rewardRP:         3000,
    failMsg:          '45초를 초과했습니다. 핵 발사 시퀀스가 영구 봉인됐습니다.',
  },

  blind: {
    title:    'BLIND VAULT',
    subtitle: 'PROJECT: BLACKOUT',
    color:    '#aa44ff',
    icon:     '🙈',
    story: [
      '// INTELLIGENCE BLACKOUT — LEVEL 5 CLEARANCE REVOKED',
      '공개키 e 가 기밀 처리됐습니다.',
      '당신에게 주어진 것은 n 과 c 뿐.',
      'e 는 존재한다. 단지 보이지 않을 뿐.',
      '진정한 해커는 없는 정보에서 길을 찾는다.',
    ],
    difficulty:       'expert',
    timeLimitOverride: undefined,
    blindMode:        true,
    totalRounds:      1,
    rewardCoins:      2000,
    rewardRP:         4000,
    failMsg:          '시간이 초과됐습니다. 블랙아웃이 지속됩니다.',
  },

  nightmare: {
    title:    'NIGHTMARE ×20',
    subtitle: 'THE GAUNTLET',
    color:    '#ff2d78',
    icon:     '💀',
    story: [
      '// GAUNTLET PROTOCOL — NO CHECKPOINTS',
      '20개의 RSA 암호가 연쇄 잠금됐습니다.',
      '단 하나라도 실패하면 처음부터.',
      'Expert 난이도. 90초. 힌트 없음.',
      '마스터 에이전트임을 증명하라.',
    ],
    difficulty:       'expert',
    timeLimitOverride: undefined,
    blindMode:        false,
    totalRounds:      20,
    rewardCoins:      5000,
    rewardRP:         8000,
    failMsg:          '실패했습니다. 모든 진행이 초기화됩니다.',
  },
}

// ─── 페이지 ───────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const type      = ((location.state as { type?: string })?.type ?? 'speed') as ChallengeType
  const cfg       = CONFIGS[type] ?? CONFIGS.speed

  const [view,           setView]          = useState<View>('intro')
  const [bootLine,       setBootLine]      = useState(0)
  const [nightmareRound, setNightmareRound]= useState(1)
  const [roundKey,       setRoundKey]      = useState(0)   // 변경 시 PuzzleBoard remount
  const [clearTime,      setClearTime]     = useState(0)
  const [failedRound,    setFailedRound]   = useState(1)

  const addCoins      = usePlayerStore(s => s.addCoins)
  const addRankPoints = usePlayerStore(s => s.addRankPoints)

  // ── 인트로 라인 타이핑 애니메이션 ──────────────────────────────
  useEffect(() => {
    if (view !== 'intro' || bootLine >= cfg.story.length) return
    const delay = bootLine === 0 ? 300 : 600 + Math.random() * 250
    const id = setTimeout(() => setBootLine(l => l + 1), delay)
    return () => clearTimeout(id)
  }, [view, bootLine, cfg.story.length])

  // ── 챌린지 시작 ─────────────────────────────────────────────────
  function startChallenge() {
    usePuzzleStore.getState().resetPuzzle()
    setNightmareRound(1)
    setRoundKey(k => k + 1)
    setView('play')
  }

  // ── 풀이 완료 콜백 ──────────────────────────────────────────────
  function onSolve(elapsed: number) {
    if (type === 'nightmare' && nightmareRound < cfg.totalRounds) {
      // 나이트메어: 다음 라운드 로드
      usePuzzleStore.getState().resetPuzzle()
      setNightmareRound(r => r + 1)
      setRoundKey(k => k + 1)
    } else {
      // 클리어!
      setClearTime(elapsed)
      addCoins(cfg.rewardCoins)
      addRankPoints(cfg.rewardRP, {
        source: 'vault',
        label:  cfg.title,
        rp:     cfg.rewardRP,
      })
      setView('clear')
    }
  }

  // ── 실패 콜백 ───────────────────────────────────────────────────
  function onFail() {
    if (type === 'nightmare') setFailedRound(nightmareRound)
    setView('fail')
  }

  // ── 재도전 ──────────────────────────────────────────────────────
  function retry() {
    usePuzzleStore.getState().resetPuzzle()
    setNightmareRound(1)
    setRoundKey(k => k + 1)
    setView('play')
  }

  // ═══════════════════════════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════════════════════════
  if (view === 'intro') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <NavBar />

      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        {/* 아이콘 */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: `drop-shadow(0 0 20px ${cfg.color})` }}>
          {cfg.icon}
        </div>

        {/* 제목 */}
        <div style={{ fontFamily: 'Rajdhani', fontSize: 'clamp(1.8rem,5vw,2.8rem)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: cfg.color, textShadow: `0 0 30px ${cfg.color}88`, marginBottom: '0.3rem' }}>
          {cfg.title}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '2.5rem' }}>
          {cfg.subtitle}
        </div>

        {/* 스토리 라인 */}
        <div style={{ textAlign: 'left', marginBottom: '2.5rem', minHeight: '9rem' }}>
          {cfg.story.slice(0, bootLine).map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: i === 0 ? '0.65rem' : '0.82rem',
                color: i === 0 ? cfg.color : i === cfg.story.length - 1 ? cfg.color : 'var(--tx2)',
                letterSpacing: i === 0 ? '0.25em' : '0.05em',
                marginBottom: '0.55rem',
                borderLeft: i === 0 ? `2px solid ${cfg.color}` : 'none',
                paddingLeft: i === 0 ? '0.6rem' : '0',
                animation: 'fadeSlideIn 0.35s ease',
                textShadow: i === cfg.story.length - 1 ? `0 0 12px ${cfg.color}88` : 'none',
              }}
            >
              {i === 0 ? line : `> ${line}`}
            </div>
          ))}
          {/* 커서 블링크 */}
          {bootLine < cfg.story.length && (
            <span style={{ fontFamily: 'JetBrains Mono', color: cfg.color, animation: 'blink 0.8s step-end infinite' }}>█</span>
          )}
        </div>

        {/* 보상 칩 */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            ['보상 코인', `+${cfg.rewardCoins.toLocaleString()}`, '#ffd700'],
            ['보상 RP',   `+${cfg.rewardRP.toLocaleString()}`,   '#aa88ff'],
            type === 'nightmare'
              ? ['연속 클리어', `×${cfg.totalRounds}`, cfg.color]
              : ['제한 시간', cfg.timeLimitOverride != null ? `${cfg.timeLimitOverride}초` : '90초', cfg.color],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ textAlign: 'center', background: 'var(--bg-card)', border: `1px solid ${c as string}33`, padding: '0.5rem 1rem' }}>
              <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '0.2rem' }}>{l}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '1.2rem', fontWeight: 700, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>

        {/* 시작 버튼 */}
        {bootLine >= cfg.story.length && (
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', animation: 'fadeSlideIn 0.4s ease' }}>
            <button
              onClick={startChallenge}
              style={{
                padding: '0.9rem 2.5rem',
                background: cfg.color,
                color: '#050810',
                border: 'none',
                fontFamily: 'Rajdhani',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
                boxShadow: `0 0 24px ${cfg.color}66`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${cfg.color}` }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 24px ${cfg.color}66` }}
            >
              ▶ MISSION START
            </button>
            <button
              onClick={() => navigate('/shop')}
              style={{ padding: '0.9rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--tx2)', fontFamily: 'Rajdhani', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              ← 상점
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════
  // PLAY
  // ═══════════════════════════════════════════════════════════════
  if (view === 'play') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '5.5rem 1.5rem 3rem' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: cfg.color }}>
              {cfg.icon} {cfg.subtitle}
            </span>
            <h2 style={{ fontFamily: 'Rajdhani', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--tx)', margin: '0.2rem 0 0' }}>
              {cfg.title}
            </h2>
          </div>

          {/* 나이트메어 진행 표시 */}
          {type === 'nightmare' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '2rem', fontWeight: 700, color: cfg.color, textShadow: `0 0 12px ${cfg.color}88`, lineHeight: 1 }}>
                {nightmareRound} <span style={{ fontSize: '1rem', color: 'var(--tx3)' }}>/ {cfg.totalRounds}</span>
              </div>
              <div style={{ fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--tx3)' }}>ROUND</div>
              {/* 진행 바 */}
              <div style={{ width: 120, height: 3, background: 'var(--border)', marginTop: '0.35rem', borderRadius: 2 }}>
                <div style={{ height: '100%', background: cfg.color, width: `${((nightmareRound - 1) / cfg.totalRounds) * 100}%`, boxShadow: `0 0 6px ${cfg.color}`, transition: 'width 0.4s ease', borderRadius: 2 }} />
              </div>
            </div>
          )}

          <button
            onClick={() => setView('intro')}
            style={{ background: 'transparent', border: `1px solid ${cfg.color}55`, color: cfg.color, padding: '0.4rem 1rem', fontFamily: 'JetBrains Mono', fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            ← 나가기
          </button>
        </div>

        {/* BLIND 모드 안내 배너 */}
        {type === 'blind' && (
          <div style={{ padding: '0.65rem 1rem', background: 'rgba(170,68,255,0.08)', border: '1px solid rgba(170,68,255,0.3)', fontSize: '0.75rem', color: '#aa44ff', marginBottom: '1.25rem', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>
            🙈 BLACKOUT MODE — 공개키 <strong>e</strong> 가 기밀 처리됐습니다. STEP 3에서 공통 후보 [3, 5, 7, 11, 13, 17, 19, 23] 중 하나입니다.
          </div>
        )}

        <PuzzleBoard
          key={roundKey}
          difficulty={cfg.difficulty}
          blindMode={cfg.blindMode}
          timeLimitOverride={cfg.timeLimitOverride}
          onSolve={onSolve}
          onFail={onFail}
          onReset={() => setView('intro')}
        />
      </main>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════
  // CLEAR
  // ═══════════════════════════════════════════════════════════════
  if (view === 'clear') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NavBar />
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${cfg.color}55`,
          padding: '3rem 3.5rem',
          maxWidth: 480,
          boxShadow: `0 0 50px ${cfg.color}22`,
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem', filter: `drop-shadow(0 0 16px ${cfg.color})` }}>
            {cfg.icon}
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '0.2em', color: cfg.color, textShadow: `0 0 20px ${cfg.color}`, marginBottom: '0.3rem' }}>
            CHALLENGE CLEAR
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '2rem' }}>
            {cfg.subtitle}
          </div>

          {/* 결과 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {[
              ['TIME',  `${Math.floor(clearTime / 60)}:${String(clearTime % 60).padStart(2, '0')}`, 'var(--cyan)'],
              ['COINS', `+${cfg.rewardCoins.toLocaleString()}`, 'var(--green)'],
              ['RP',    `+${cfg.rewardRP.toLocaleString()}`, '#aa88ff'],
            ].map(([l, v, c]) => (
              <div key={l as string} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.75rem 0.5rem' }}>
                <div style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '0.3rem' }}>{l}</div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', fontWeight: 700, color: c as string, textShadow: `0 0 8px ${c}88` }}>{v}</div>
              </div>
            ))}
          </div>

          {type === 'nightmare' && (
            <div style={{ fontSize: '0.75rem', color: cfg.color, fontFamily: 'JetBrains Mono', marginBottom: '1.5rem', letterSpacing: '0.08em' }}>
              🏆 Expert 20연속 클리어 달성 — 진정한 마스터 에이전트
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={retry}
              style={{ padding: '0.75rem 1.75rem', background: cfg.color, color: '#050810', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
            >
              재도전
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--tx2)', border: '1px solid var(--border)', fontFamily: 'Rajdhani', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════
  // FAIL
  // ═══════════════════════════════════════════════════════════════
  if (view === 'fail') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <NavBar />
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid rgba(255,45,120,0.4)', padding: '3rem', maxWidth: 420, boxShadow: '0 0 40px rgba(255,45,120,0.1)' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '2rem', fontWeight: 700, color: 'var(--mag)', letterSpacing: '0.2em', marginBottom: '0.75rem' }}>
            ⏱ MISSION FAILED
          </div>

          {type === 'nightmare' && (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--tx2)', marginBottom: '0.5rem' }}>
              Round <span style={{ color: cfg.color, fontWeight: 700 }}>{failedRound}</span> / {cfg.totalRounds} 에서 실패
            </div>
          )}

          <p style={{ color: 'var(--tx2)', fontSize: '0.78rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            {cfg.failMsg}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={retry}
              style={{ padding: '0.65rem 1.75rem', background: 'var(--mag)', color: '#050810', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              재도전
            </button>
            <button
              onClick={() => navigate('/shop')}
              style={{ padding: '0.65rem 1.25rem', background: 'transparent', color: 'var(--tx2)', border: '1px solid var(--border)', fontFamily: 'Rajdhani', cursor: 'pointer' }}
            >
              상점
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.65rem 1.25rem', background: 'transparent', color: 'var(--tx2)', border: '1px solid var(--border)', fontFamily: 'Rajdhani', cursor: 'pointer' }}
            >
              HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}
