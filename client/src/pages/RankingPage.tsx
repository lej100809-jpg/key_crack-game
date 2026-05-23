import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import RankBadge, { TierList } from '@/components/ui/RankBadge'
import PixelIcon from '@/components/ui/PixelIcon'
import { usePlayerStore } from '@/store/usePlayerStore'
import { getTier, RANK_TIERS } from '@/data/rankSystem'
import { fetchLeaderboard, isConfigured, type PlayerRow } from '@/lib/supabase'
type LeaderboardEntry = PlayerRow

type Tab = 'my' | 'tiers' | 'history'

const SOURCE_ICON: Record<string, string> = {
  stage: 'folder', vault: 'lock', battle_win: 'crossed_swords', battle_round: 'crossed_swords',
}
const SOURCE_COLOR: Record<string, string> = {
  stage: 'var(--cyan)', vault: '#ffd700', battle_win: 'var(--mag)', battle_round: '#ff8844',
}

export default function RankingPage() {
  const navigate      = useNavigate()
  const [tab, setTab] = useState<Tab>('my')
  const [globalBoard, setGlobalBoard] = useState<LeaderboardEntry[]>([])
  const [loading,     setLoading]     = useState(false)

  const player       = usePlayerStore(s => s.player)
  const rp           = usePlayerStore(s => s.rankPoints)
  const scoreHistory = usePlayerStore(s => s.scoreHistory)
  const tier         = getTier(rp)

  /* Firestore 리더보드 불러오기 */
  useEffect(() => {
    if (!isConfigured) return
    setLoading(true)
    fetchLeaderboard(20)
      .then(setGlobalBoard)
      .finally(() => setLoading(false))
  }, [])

  /* 리더보드 표시 데이터: Firestore 있으면 글로벌, 없으면 로컬만 */
  const leaderboard = isConfigured && globalBoard.length > 0
    ? globalBoard.map((e, i) => ({
        rank: i + 1, nickname: e.nickname, rp: e.rank_points,
        tierId: getTier(e.rank_points).id,
        isMe: e.id === player?.id,
      }))
    : (player && rp > 0
        ? [{ rank: 1, nickname: player.nickname, rp, tierId: tier.id, isMe: true }]
        : [])

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth:900, margin:'0 auto', padding:'5.5rem 1.5rem 3rem' }}>

        {/* 헤더 */}
        <div style={{ marginBottom:'2rem' }}>
          <span style={{ fontSize:'0.62rem', letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cyan)', display:'block', marginBottom:'0.3rem' }}>// RANKING SYSTEM</span>
          <h1 style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
            글로벌 <span style={{ color:'var(--cyan)' }}>랭킹</span>
          </h1>
        </div>

        {/* 내 현재 티어 카드 */}
        {player && (
          <div className="hud" style={{ padding:'1.5rem', marginBottom:'2rem', background:`linear-gradient(135deg, ${tier.color}08, var(--bg-panel))` }}>
            <div style={{ display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
              <RankBadge rp={rp} size="lg" showBar />
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontFamily:'Rajdhani', fontSize:'1.2rem', fontWeight:700, color:'var(--tx)', letterSpacing:'0.08em', marginBottom:'0.3rem' }}>
                  {player.nickname}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--tx2)', lineHeight:1.7, maxWidth:340 }}>
                  {tier.desc}
                </div>
              </div>
              <div style={{ display:'flex', gap:'1.5rem', flexShrink:0 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>총 RP</div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1.6rem', fontWeight:700, color:tier.color }}>{rp.toLocaleString()}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>기록 수</div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1.6rem', fontWeight:700, color:'var(--cyan)' }}>{scoreHistory.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 탭 */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
          {([
            { id:'my' as Tab,      label:'리더보드',  icon:'star' },
            { id:'tiers' as Tab,   label:'티어 목록',  icon:'medal' },
            { id:'history' as Tab, label:'내 기록',   icon:'folder' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'0.6rem 1rem', background:'none', border:'none',
              borderBottom: tab===t.id ? '2px solid var(--cyan)' : '2px solid transparent',
              color: tab===t.id ? 'var(--cyan)' : 'var(--tx2)',
              fontFamily:'JetBrains Mono', fontSize:'0.72rem', letterSpacing:'0.1em', cursor:'pointer',
              display:'flex', alignItems:'center', gap:'0.4rem', whiteSpace:'nowrap',
            }}>
              <PixelIcon name={t.icon} scale={2} color={tab===t.id ? 'var(--cyan)' : '#7a90a8'} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── 리더보드 탭 ──────────────────────────────── */}
        {tab === 'my' && (
          <div>
            {/* Firebase 상태 */}
            {!isConfigured && (
              <div style={{ padding:'0.6rem 1rem', background:'rgba(255,187,0,0.07)', border:'1px solid rgba(255,187,0,0.25)', fontSize:'0.72rem', color:'var(--warn)', marginBottom:'1rem', lineHeight:1.6 }}>
                ⚠ Firebase 미설정 — 현재 로컬 데이터만 표시됩니다.
                <br />글로벌 랭킹을 활성화하려면 <code>.env.local</code>에 Firebase 키를 설정하세요.
              </div>
            )}
            {loading && (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--tx3)', fontFamily:'JetBrains Mono', fontSize:'0.75rem' }}>
                리더보드 불러오는 중...
              </div>
            )}
            {!loading && leaderboard.length === 0 && (
              <div style={{ textAlign:'center', padding:'3.5rem 2rem', color:'var(--tx3)', fontFamily:'JetBrains Mono', fontSize:'0.8rem', border:'1px solid var(--border)' }}>
                <div style={{ marginBottom:'0.75rem' }}>
                  <PixelIcon name="star" scale={4} color="var(--tx3)" />
                </div>
                아직 등록된 요원이 없습니다.<br />
                <span style={{ fontSize:'0.68rem', color:'var(--tx3)', opacity:0.7 }}>스테이지·볼트·배틀을 클리어하면 자동으로 등록됩니다.</span>
              </div>
            )}

            {leaderboard.length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'2.5rem 1fr auto auto', gap:'0 1rem', marginBottom:'0.5rem' }}>
              {['RANK','AGENT','TIER','RP'].map(h => (
                <div key={h} style={{ fontFamily:'JetBrains Mono', fontSize:'0.58rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--tx3)', padding:'0 0.5rem 0.4rem' }}>{h}</div>
              ))}
            </div>
            )}
            {leaderboard.map(entry => {
              const entryTier = RANK_TIERS.find(t => t.id === entry.tierId) ?? RANK_TIERS[0]
              const isMe = (entry as any).isMe
              return (
                <div key={entry.rank} style={{
                  display:'grid', gridTemplateColumns:'2.5rem 1fr auto auto', gap:'0 1rem',
                  padding:'0.65rem 0.5rem',
                  background: isMe ? `${entryTier.color}0d` : 'transparent',
                  borderBottom:'1px solid var(--border)',
                  border: isMe ? `1px solid ${entryTier.color}33` : '1px solid transparent',
                  borderLeft: isMe ? `3px solid ${entryTier.color}` : '3px solid transparent',
                  marginBottom: '0.2rem',
                  alignItems:'center',
                }}>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color: entry.rank<=3 ? ['#ffd700','#c0c0c0','#cd7f32'][entry.rank-1] : 'var(--tx3)', textAlign:'center' }}>
                    {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : entry.rank}
                  </div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, color: isMe ? entryTier.color : 'var(--tx)', letterSpacing:'0.08em' }}>
                    {entry.nickname}
                    {isMe && <span style={{ marginLeft:'0.5rem', fontSize:'0.58rem', color:entryTier.color, fontFamily:'JetBrains Mono' }}>← YOU</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
                    <PixelIcon name={entryTier.icon} scale={2} color={entryTier.color} />
                    <span style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', color:entryTier.color, letterSpacing:'0.1em' }}>{entryTier.name}</span>
                  </div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:entryTier.color, textAlign:'right' }}>
                    {entry.rp.toLocaleString()}
                  </div>
                </div>
              )
            })}

            <div style={{ marginTop:'1rem', padding:'0.75rem 1rem', background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)', fontSize:'0.72rem', color:'var(--tx2)' }}>
              <PixelIcon name="bolt" scale={2} color="var(--cyan)" style={{ marginRight:6 }} />
              리더보드는 스테이지 클리어, 금고 해독, 배틀 승리로 획득한 RP 기준입니다.
              Firebase 연동 후 글로벌 랭킹이 활성화됩니다.
            </div>
          </div>
        )}

        {/* ── 티어 목록 탭 ─────────────────────────────── */}
        {tab === 'tiers' && (
          <div>
            <div style={{ padding:'0.75rem 1rem', background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.18)', fontSize:'0.75rem', color:'var(--tx2)', marginBottom:'1.25rem', lineHeight:1.7 }}>
              <strong style={{ color:'var(--cyan)' }}>RP 획득 방법:</strong><br />
              • 스테이지 클리어: 난이도별 기본점 + 남은시간×3 - 힌트사용×25<br />
              • 금고 해독: 등급별 기본점(Bronze 300 ~ Platinum 2200) + 남은시간×5<br />
              • 배틀 라운드: 100 + 라운드번호×50 + 남은시간×2 / 배틀 승리: +300 RP
            </div>
            <TierList currentRp={rp} />
          </div>
        )}

        {/* ── 내 기록 탭 ───────────────────────────────── */}
        {tab === 'history' && (
          <div>
            {scoreHistory.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:'var(--tx3)', fontFamily:'JetBrains Mono', fontSize:'0.8rem' }}>
                아직 기록이 없습니다. 스테이지를 클리어해 첫 RP를 획득하세요!
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {scoreHistory.map(rec => (
                  <div key={rec.id} style={{
                    display:'flex', alignItems:'center', gap:'0.75rem',
                    padding:'0.65rem 0.9rem', background:'var(--bg-card)', border:'1px solid var(--border)',
                  }}>
                    <PixelIcon name={SOURCE_ICON[rec.source] ?? 'star'} scale={2} color={SOURCE_COLOR[rec.source] ?? 'var(--cyan)'} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--tx)', letterSpacing:'0.05em' }}>{rec.label}</div>
                      <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.58rem', color:'var(--tx3)', marginTop:'0.1rem' }}>
                        {new Date(rec.ts).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                    <div style={{ fontFamily:'Rajdhani', fontSize:'1.1rem', fontWeight:700, color: SOURCE_COLOR[rec.source] ?? 'var(--cyan)' }}>
                      +{rec.rp.toLocaleString()} RP
                    </div>
                  </div>
                ))}
              </div>
            )}
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
