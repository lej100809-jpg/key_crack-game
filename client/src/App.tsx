import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import HomePage       from './pages/HomePage'
import TutorialPage   from './pages/TutorialPage'
import LearnPage      from './pages/LearnPage'
import StageModePage  from './pages/StageModePage'
import VaultModePage  from './pages/VaultModePage'
import BattleModePage from './pages/BattleModePage'
import ChallengePage  from './pages/ChallengePage'
import ShopPage       from './pages/ShopPage'
import RankingPage    from './pages/RankingPage'
import { onAuthChange, upsertPlayer, getPlayer } from './lib/supabase'
import { usePlayerStore } from './store/usePlayerStore'
import { useTutorialStore, selectNeedsTutorial } from './store/useTutorialStore'
import MobileTabBar from './components/ui/MobileTabBar'

export default function App() {
  const initPlayer      = usePlayerStore(s => s.initPlayer)
  const syncRankPoints  = usePlayerStore(s => s.syncRankPoints)
  const player        = usePlayerStore(s => s.player)
  const needsTutorial = useTutorialStore(selectNeedsTutorial)
  const navigate      = useNavigate()
  const { pathname }  = useLocation()

  /* Supabase 인증 상태 감지 */
  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (user) {
        initPlayer(user.id, user.name)
        upsertPlayer({ id: user.id, nickname: user.name }).catch(() => {})
        getPlayer(user.id).then(row => {
          if (row?.rank_points) syncRankPoints(row.rank_points)
        }).catch(() => {})
      }
    })
    return unsub
  }, [initPlayer])

  /* 홈(/)에서만 튜토리얼 미완료 시 이동
     - hydration 완료(_hydrated) 후에만 실행되므로 타이밍 버그 없음 */
  useEffect(() => {
    if (player && needsTutorial && pathname === '/') {
      navigate('/tutorial')
    }
  }, [player, needsTutorial, pathname, navigate])

  return (
    <>
      <div className="scanlines" />
      <MobileTabBar />
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/learn"    element={<LearnPage />} />
        <Route path="/stage"    element={<StageModePage />} />
        <Route path="/vault"      element={<VaultModePage />} />
        <Route path="/challenge"  element={<ChallengePage />} />
        <Route path="/battle"     element={<BattleModePage />} />
        <Route path="/shop"     element={<ShopPage />} />
        <Route path="/ranking"  element={<RankingPage />} />
      </Routes>
    </>
  )
}
