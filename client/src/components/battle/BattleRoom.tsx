import { useEffect, useState } from 'react'
import { useBattleStore, selectMyPlayer, selectOpponent, selectIsInBattle } from '@/store/useBattleStore'
import { usePuzzleStore } from '@/store/usePuzzleStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { BATTLE_ROUNDS } from '@/types'
import type { SkillType } from '@/types'
import { calcBattleRoundScore, BATTLE_WIN_BONUS } from '@/data/rankSystem'
import PuzzleBoard    from '@/components/puzzle/PuzzleBoard'
import OpponentPanel  from './OpponentPanel'
import SkillBar       from './SkillBar'

interface Props {
  onGameOver?: () => void
}

export default function BattleRoom({ onGameOver }: Props) {
  const {
    room, myId,
    roundResults, finalRanking,
    submitRound, useSkill, setReady,
    initSocketListeners,
  } = useBattleStore()

  const myPlayer  = useBattleStore(selectMyPlayer)
  const opponent  = useBattleStore(selectOpponent)
  const isInBattle = useBattleStore(selectIsInBattle)

  const [shieldActive, setShieldActive] = useState(false)
  const [skillFlash, setSkillFlash]     = useState<string | null>(null)

  /* Socket 리스너 등록 */
  useEffect(() => {
    const cleanup = initSocketListeners()
    return cleanup
  }, [initSocketListeners])

  /* 스킬 사용 핸들러 */
  function handleSkill(skill: SkillType) {
    if (!opponent) return
    if (skill === 'shield') { setShieldActive(true); return }
    useSkill(skill, opponent.id)
    setSkillFlash(skill)
    setTimeout(() => setSkillFlash(null), 800)
  }

  const addRankPoints = usePlayerStore(s => s.addRankPoints)

  /* 게임 오버 — RP 지급 */
  useEffect(() => {
    if (room?.status !== 'game_over') return
    const isWinner = finalRanking[0]?.playerId === myId
    // 라운드 점수 합산
    let totalRp = roundResults.reduce((sum, r) => {
      if (r.playerId !== myId || !r.correct) return sum
      const roundNum = room.currentRound ?? 1
      return sum + calcBattleRoundScore({ correct: true, timeTaken: r.timeTaken, roundNum })
    }, 0)
    if (isWinner) totalRp += BATTLE_WIN_BONUS
    if (totalRp > 0) {
      addRankPoints(totalRp, {
        source: isWinner ? 'battle_win' : 'battle_round',
        label:  isWinner ? 'Battle 승리' : 'Battle 참가',
        rp:     totalRp,
      })
    }
    onGameOver?.()
  }, [room?.status])

  if (!room) return null

  const roundCfg = BATTLE_ROUNDS.find(r => r.round === room.currentRound)
  const skillsEnabled = roundCfg?.skillsEnabled ?? false

  /* ── 대기실 ──────────────────────────────────────────── */
  if (room.status === 'waiting') return (
    <div style={{ padding: '2.5rem', textAlign: 'center' }}>
      <div className="hud" style={{ padding: '2rem', maxWidth: 460, margin: '0 auto' }}>
        <div className="panel-tag">WAITING ROOM</div>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--tx)', marginBottom: '1.25rem' }}>
          상대방을 기다리는 중...
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
          {room.players.map(p => (
            <div key={p.id} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 0.5rem',
                border: `2px solid ${p.id === myId ? 'var(--cyan)' : 'var(--mag)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', background: 'var(--bg-input)',
              }}>
                {p.id === myId ? '👤' : '🤖'}
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '0.85rem', color: p.id === myId ? 'var(--cyan)' : 'var(--mag)', letterSpacing: '0.1em' }}>
                {p.nickname}
              </div>
              <div style={{ fontSize: '0.6rem', color: p.isReady ? 'var(--green)' : 'var(--tx3)', marginTop: '0.25rem', letterSpacing: '0.15em' }}>
                {p.isReady ? '● READY' : '● WAITING'}
              </div>
            </div>
          ))}
        </div>
        {!myPlayer?.isReady && (
          <button
            onClick={setReady}
            style={{ padding: '0.75rem 2.5rem', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}
          >
            ✓ READY
          </button>
        )}
        {myPlayer?.isReady && (
          <div style={{ color: 'var(--green)', fontSize: '0.8rem', letterSpacing: '0.15em' }}>준비 완료 — 상대방 대기 중</div>
        )}
      </div>
    </div>
  )

  /* ── 라운드 종료 ──────────────────────────────────────── */
  if (room.status === 'round_end') return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="hud" style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
        <div className="panel-tag">ROUND {room.currentRound} RESULT</div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {roundResults.map(r => (
            <div key={r.playerId} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '0.8rem', color: r.playerId === myId ? 'var(--cyan)' : 'var(--mag)', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
                {r.playerId === myId ? (myPlayer?.nickname ?? 'YOU') : (opponent?.nickname ?? 'OPP')}
              </div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '2rem', fontWeight: 700, color: r.correct ? 'var(--green)' : 'var(--mag)' }}>
                {r.correct ? '+' + r.score : '✗'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--tx3)' }}>{r.timeTaken}s</div>
            </div>
          ))}
        </div>
        <div style={{ color: 'var(--tx2)', fontSize: '0.75rem' }}>다음 라운드 준비 중...</div>
      </div>
    </div>
  )

  /* ── 게임 오버 ────────────────────────────────────────── */
  if (room.status === 'game_over') return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="hud" style={{ padding: '2.5rem', maxWidth: 480, margin: '0 auto' }}>
        <div className="panel-tag">BATTLE OVER</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {finalRanking.map((r, i) => (
            <div key={r.playerId} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem',
              background: r.playerId === myId ? 'rgba(0,212,255,0.08)' : 'var(--bg-input)',
              border: `1px solid ${r.playerId === myId ? 'var(--cyan)' : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: 'Rajdhani', fontSize: '1.2rem', fontWeight: 700, color: i === 0 ? '#ffd700' : 'var(--tx2)' }}>
                  {i === 0 ? '🏆' : '🥈'}
                </span>
                <span style={{ fontFamily: 'Rajdhani', fontSize: '0.95rem', color: r.playerId === myId ? 'var(--cyan)' : 'var(--tx)' }}>
                  {r.nickname}
                </span>
              </div>
              <span style={{ fontFamily: 'Rajdhani', fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }}>
                {r.totalScore}pts
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '1.4rem', fontWeight: 700, color: finalRanking[0]?.playerId === myId ? 'var(--green)' : 'var(--mag)' }}>
            {finalRanking[0]?.playerId === myId ? '🎉 VICTORY!' : 'DEFEAT'}
          </div>
          {finalRanking[0]?.playerId === myId && (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#aa88ff', marginTop: '0.35rem', letterSpacing: '0.1em' }}>
              +{BATTLE_WIN_BONUS} RP (승리 보너스 포함)
            </div>
          )}
        </div>
        <button onClick={onGameOver} style={{ padding: '0.7rem 2rem', background: 'var(--cyan)', color: 'var(--bg)', border: 'none', fontFamily: 'Rajdhani', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
          LOBBY
        </button>
      </div>
    </div>
  )

  /* ── 라운드 진행 중 ──────────────────────────────────── */
  if (!isInBattle || !room.puzzle) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--tx3)', fontFamily: 'JetBrains Mono' }}>
      라운드 시작 대기 중...
    </div>
  )

  return (
    <div>
      {/* 라운드 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {BATTLE_ROUNDS.map(r => (
            <div key={r.round} style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${r.round === room.currentRound ? 'var(--cyan)' : r.round < room.currentRound ? 'var(--green)' : 'var(--border)'}`,
              color:  r.round === room.currentRound ? 'var(--cyan)' : r.round < room.currentRound ? 'var(--green)' : 'var(--tx3)',
              fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700,
              background: r.round === room.currentRound ? 'rgba(0,212,255,0.08)' : 'transparent',
            }}>
              {r.round < room.currentRound ? '✓' : r.round}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--tx2)' }}>
          ROUND {room.currentRound} / {room.totalRounds} — {roundCfg?.difficulty.toUpperCase()}
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
          <span style={{ color: 'var(--cyan)' }}>ME: {myPlayer?.score ?? 0}pts</span>
          <span style={{ color: 'var(--mag)' }}>OPP: {opponent?.score ?? 0}pts</span>
        </div>
      </div>

      {/* 스킬 사용 플래시 */}
      {skillFlash && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          fontFamily: 'Rajdhani', fontSize: '2rem', fontWeight: 700, color: 'var(--mag)',
          textShadow: '0 0 20px var(--mag)', zIndex: 200, pointerEvents: 'none',
          animation: 'fadeIn 0.2s',
        }}>
          {skillFlash === 'fake_hint' ? '🎭 가짜 힌트 전송!' : '⏱ 시간 삭감!'}
        </div>
      )}

      {/* 메인 레이아웃 */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <PuzzleBoard
            difficulty={roundCfg?.difficulty ?? 'medium'}
            onSolve={(timeSec) => submitRound(usePuzzleStore.getState().inputs.m ?? 0, timeSec)}
          />
        </div>

        {/* 사이드 패널 */}
        <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <OpponentPanel opponent={opponent} isSkillBlocked={shieldActive} />
          {skillsEnabled && (
            <SkillBar
              availableSkills={myPlayer?.skills ?? []}
              cooldowns={myPlayer?.skillCooldowns ?? {} as Record<SkillType, number>}
              shieldActive={shieldActive}
              onUse={handleSkill}
            />
          )}
          {!skillsEnabled && (
            <div style={{ padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--tx3)', textAlign: 'center', letterSpacing: '0.1em' }}>
              🔒 스킬 ROUND 3~
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
