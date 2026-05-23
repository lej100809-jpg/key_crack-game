import { useNavigate, useLocation } from 'react-router-dom'
import { usePlayerStore, selectCoins, selectRating } from '@/store/usePlayerStore'
import PixelIcon from './PixelIcon'

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const player  = usePlayerStore(s => s.player)
  const coins   = usePlayerStore(selectCoins)
  const rating  = usePlayerStore(selectRating)

  const links = [
    { path: '/',       label: 'HOME'  },
    { path: '/stage',  label: 'STAGE' },
    { path: '/vault',  label: 'VAULT' },
    { path: '/battle', label: 'BATTLE'},
    { path: '/ranking', label: 'RANK' },
    { path: '/shop',    label: 'SHOP' },
    { path: '/learn',   label: 'LEARN' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      background: 'rgba(5,8,16,0.88)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* 로고 */}
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{
          fontFamily: 'Rajdhani, sans-serif', fontSize: '1.35rem',
          fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
        }}>
          <span style={{ color: 'var(--cyan)', textShadow: '0 0 14px var(--cyan-dim)' }}>KEY</span>
          {' '}
          <span style={{ color: 'var(--mag)', textShadow: '0 0 14px var(--mag-dim)' }}>CRACK</span>
        </span>
      </button>

      {/* 링크 */}
      <div style={{ display: 'flex', gap: '1.75rem' }}>
        {links.map(l => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: pathname === l.path ? 'var(--cyan)' : 'var(--tx2)',
              textShadow: pathname === l.path ? '0 0 8px var(--cyan-dim)' : 'none',
              borderBottom: pathname === l.path ? '1px solid var(--cyan)' : '1px solid transparent',
              paddingBottom: '2px', transition: 'all 0.2s',
            }}
          >
            {l.path === '/shop'
              ? <><PixelIcon name="bag" scale={2} color={pathname === '/shop' ? 'var(--cyan)' : '#7a90a8'} style={{ marginRight: 4 }} />{l.label}</>
              : l.label
            }
          </button>
        ))}
      </div>

      {/* 플레이어 정보 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {player ? (
          <>
            <span style={{ fontSize: '0.7rem', color: 'var(--warn)', letterSpacing: '0.1em' }}>
              💰 {coins.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '0.1em' }}>
              📡 {rating}
            </span>
            <span style={{
              fontFamily: 'Rajdhani', fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--tx)', letterSpacing: '0.1em',
            }}>
              {player.nickname}
            </span>
          </>
        ) : (
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent', border: '1px solid var(--cyan)',
              color: 'var(--cyan)', padding: '0.35rem 1rem',
              fontFamily: 'JetBrains Mono', fontSize: '0.68rem',
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            LOGIN
          </button>
        )}
      </div>
    </nav>
  )
}
