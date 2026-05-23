import { useState } from 'react'
import { modPow } from '@/lib/rsa'

interface Props {
  onPaste?: (value: number) => void
}

type Op = '+' | '-' | '*' | '/' | 'mod' | 'pow'

const BTN = (label: string, type: 'num' | 'op' | 'fn' | 'eq' | 'paste') =>
  ({ label, type } as const)

const BUTTONS = [
  [BTN('C','fn'),   BTN('←','fn'),  BTN('mod','op'), BTN('pow','op')],
  [BTN('7','num'),  BTN('8','num'),  BTN('9','num'),  BTN('÷','op')],
  [BTN('4','num'),  BTN('5','num'),  BTN('6','num'),  BTN('×','op')],
  [BTN('1','num'),  BTN('2','num'),  BTN('3','num'),  BTN('-','op')],
  [BTN('0','num'),  BTN('00','num'), BTN('=','eq'),   BTN('+','op')],
  [BTN('→ STEP 4', 'paste')],
]

const OP_MAP: Record<string, Op> = {
  '÷':'/', '×':'*', '+':'+', '-':'-', 'mod':'mod', 'pow':'pow',
}

export default function Calculator({ onPaste }: Props) {
  const [display,    setDisplay]    = useState('0')
  const [operand1,   setOperand1]   = useState<number | null>(null)
  const [operator,   setOperator]   = useState<Op | null>(null)
  const [waiting,    setWaiting]    = useState(false)
  // pow-mod 연쇄 계산을 위한 보류 상태
  // c pow d mod n → modPow(c, d, n) 을 정확하게 처리
  const [powBase,    setPowBase]    = useState<number | null>(null)
  const [powExp,     setPowExp]     = useState<number | null>(null)

  const current = Number(display)

  /** 일반 이항 연산 (pow 제외) */
  function calcOp(a: number, op: Op, b: number): number {
    switch (op) {
      case '+':   return a + b
      case '-':   return a - b
      case '*':   return a * b
      case '/':   return b !== 0 ? Math.floor(a / b) : NaN
      case 'mod': return b !== 0 ? ((a % b) + b) % b : NaN
      case 'pow': {
        // pow-mod 연쇄 없이 단독으로 = 가 눌렸을 때 — 작은 수면 정확, 큰 수면 BigInt로 최대한
        const r = BigInt(a) ** BigInt(b)
        // MAX_SAFE_INTEGER 이하면 정확한 정수
        if (r <= 9007199254740991n) return Number(r)
        // 너무 크면 10자리 이하로 표시용 mod 적용 (실제 mod는 사용자가 다음에 입력)
        return Number(r % 10000000000n)
      }
    }
  }

  function pressNum(n: string) {
    if (waiting) { setDisplay(n === '00' ? '0' : n); setWaiting(false); return }
    const next = display === '0' ? (n === '00' ? '0' : n) : display + n
    if (next.length > 12) return
    setDisplay(next)
  }

  function pressOp(raw: string) {
    const op = OP_MAP[raw]

    // ── pow-mod 연쇄 탐지 ───────────────────────────────────────
    // 사용자가 "c pow d mod n =" 순서로 입력하면 modPow(c, d, n)을 계산
    if (op === 'mod' && operator === 'pow' && !waiting) {
      // "c pow d" 다음에 "mod" → c^d는 보류하고 mod 상태로 전환
      setPowBase(operand1)   // c 저장
      setPowExp(current)     // d 저장
      setOperand1(current)
      setOperator('mod')
      setWaiting(true)
      setDisplay(String(current))
      return
    }

    // 기존 연산 처리
    if (operand1 !== null && operator && !waiting) {
      const result = calcOp(operand1, operator, current)
      const disp   = isNaN(result) ? 'ERR' : String(result)
      setDisplay(disp)
      setOperand1(result)
    } else {
      setOperand1(current)
    }
    setOperator(op)
    setWaiting(true)
    // pow 누르면 현재값이 base
    if (op !== 'pow') { setPowBase(null); setPowExp(null) }
  }

  function pressEq() {
    if (operand1 === null || !operator) return

    let result: number

    // pow-mod 연쇄: powBase ^ powExp mod current
    if (operator === 'mod' && powBase !== null && powExp !== null) {
      result = modPow(powBase, powExp, current)   // 정확한 BigInt 연산
      setPowBase(null); setPowExp(null)
    } else {
      result = calcOp(operand1, operator, current)
    }

    setDisplay(String(isNaN(result) ? 'ERR' : result))
    setOperand1(null)
    setOperator(null)
    setWaiting(false)
  }

  function pressC() {
    setDisplay('0'); setOperand1(null); setOperator(null)
    setWaiting(false); setPowBase(null); setPowExp(null)
  }
  function pressBs() { setDisplay(display.length > 1 ? display.slice(0, -1) : '0') }

  function handleBtn(label: string, type: string) {
    if      (type === 'num')                      pressNum(label)
    else if (type === 'op')                       pressOp(label)
    else if (type === 'eq')                       pressEq()
    else if (type === 'fn' && label === 'C')      pressC()
    else if (type === 'fn' && label === '←')      pressBs()
    else if (type === 'paste') {
      const val = Number(display)
      if (!isNaN(val)) onPaste?.(val)
    }
  }

  // 상단 힌트 표시 (pow-mod 연쇄 진행 중이면 안내)
  const topHint = powBase !== null && powExp !== null
    ? `${powBase}^${powExp} mod ?`
    : operand1 !== null
      ? `${operand1} ${operator ?? ''}`
      : ''

  const btnColor = (type: string) => {
    if (type === 'eq')    return { bg:'var(--cyan)',             color:'var(--bg)', border:'var(--cyan)' }
    if (type === 'op')    return { bg:'rgba(0,212,255,0.1)',     color:'var(--cyan)', border:'rgba(0,212,255,0.25)' }
    if (type === 'fn')    return { bg:'rgba(255,45,120,0.1)',    color:'var(--mag)',  border:'rgba(255,45,120,0.25)' }
    if (type === 'paste') return { bg:'rgba(0,255,136,0.12)',    color:'var(--green)',border:'rgba(0,255,136,0.3)' }
    return                       { bg:'rgba(255,255,255,0.05)',  color:'var(--tx)',   border:'var(--border)' }
  }

  return (
    <div className="hud" style={{ padding: '1rem', minWidth: '240px' }}>
      <div className="panel-tag">CALCULATOR</div>

      {/* 사용법 안내 */}
      <div style={{ fontSize:'0.6rem', color:'var(--tx3)', fontFamily:'JetBrains Mono', marginBottom:'0.5rem', lineHeight:1.6 }}>
        복호화: <span style={{ color:'var(--warn)' }}>c → pow → d → mod → n → =</span>
      </div>

      {/* 디스플레이 */}
      <div style={{ background:'var(--bg-input)', border:'1px solid var(--border)', padding:'0.5rem 0.75rem', marginBottom:'0.75rem', fontFamily:'JetBrains Mono', textAlign:'right' }}>
        <div style={{ fontSize:'0.58rem', color: powBase !== null ? 'var(--warn)' : 'var(--tx3)', minHeight:'0.8rem' }}>
          {topHint}
        </div>
        <div style={{ fontSize:'1.4rem', color:'var(--green)', textShadow:'0 0 8px var(--green-dim)', letterSpacing:'0.05em' }}>
          {display}
        </div>
      </div>

      {/* 버튼 그리드 */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
        {BUTTONS.map((row, ri) => (
          <div key={ri} style={{ display:'flex', gap:'0.3rem' }}>
            {row.map(({ label, type }) => {
              const c = btnColor(type)
              return (
                <button
                  key={label}
                  onClick={() => handleBtn(label, type)}
                  style={{
                    flex:1,
                    padding: label === '→ STEP 4' ? '0.5rem' : '0.55rem 0',
                    background:c.bg, border:`1px solid ${c.border}`, color:c.color,
                    fontFamily:'JetBrains Mono',
                    fontSize: label === '→ STEP 4' ? '0.68rem' : '0.8rem',
                    fontWeight: type === 'eq' ? 700 : 400,
                    cursor:'pointer', transition:'all 0.15s', letterSpacing:'0.05em',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity='0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity='1')}
                >
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
