import { useNavigate, useLocation } from 'react-router-dom'
import PixelIcon from './PixelIcon'

const TABS = [
  { path:'/',        icon:'home',           label:'홈'    },
  { path:'/stage',   icon:'folder',         label:'스테이지' },
  { path:'/vault',   icon:'lock',           label:'볼트'   },
  { path:'/battle',  icon:'crossed_swords', label:'배틀'  },
  { path:'/ranking', icon:'star',           label:'랭킹'   },
  { path:'/shop',    icon:'bag',            label:'상점'   },
]

export default function MobileTabBar() {
  const navigate    = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="mobile-tabs" style={{ display: 'none' }} id="mobile-tabs">
      {TABS.map(t => {
        const active = pathname === t.path
        return (
          <button
            key={t.path}
            className={`mobile-tab${active ? ' active' : ''}`}
            onClick={() => navigate(t.path)}
          >
            <PixelIcon name={t.icon} scale={2} color={active ? 'var(--cyan)' : '#7a90a8'} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
