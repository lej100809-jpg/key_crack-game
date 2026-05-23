import { useMemo } from 'react'
import { primesUpTo } from '@/lib/rsa'

interface Props {
  max?: number
  highlight?: number[]   // 강조할 소수 목록
  onSelect?: (p: number) => void
}

export default function PrimeTable({ max = 97, highlight = [], onSelect }: Props) {
  const primes = useMemo(() => primesUpTo(max), [max])

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.75rem' }}>
      <div style={{
        fontSize: '0.58rem', letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--cyan)', marginBottom: '0.6rem',
      }}>
        ▶ PRIME TABLE (2 – {max})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {primes.map(p => {
          const isHL = highlight.includes(p)
          return (
            <button
              key={p}
              onClick={() => onSelect?.(p)}
              style={{
                width: '2.4rem', height: '2rem',
                background: isHL ? 'var(--cyan)' : 'rgba(0,212,255,0.06)',
                border: `1px solid ${isHL ? 'var(--cyan)' : 'rgba(0,212,255,0.18)'}`,
                color: isHL ? 'var(--bg)' : 'var(--tx)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem', cursor: onSelect ? 'pointer' : 'default',
                transition: 'all 0.15s',
                fontWeight: isHL ? 700 : 400,
                boxShadow: isHL ? '0 0 8px var(--cyan-dim)' : 'none',
              }}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}
