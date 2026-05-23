import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '@/components/ui/NavBar'
import PrimeTable from '@/components/ui/PrimeTable'
import { eulerPhi, modInverse, modPow, isPrime } from '@/lib/rsa'

/* ── 섹션 헤더 ─────────────────────────────────────────── */
function SectionHead({ tag, title, accent }: { tag: string; title: string; accent?: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <span style={{ fontSize: '0.62rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--cyan)', display: 'block', marginBottom: '0.4rem' }}>
        {tag}
      </span>
      <h2 style={{ fontFamily: 'Rajdhani', fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--tx)', margin: 0 }}>
        {title}{accent && <span style={{ color: 'var(--cyan)' }}> {accent}</span>}
      </h2>
    </div>
  )
}

/* ── 공식 박스 ─────────────────────────────────────────── */
function FormulaBox({ children, color = 'var(--green)' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', color, background: `${color}0d`, borderLeft: `3px solid ${color}`, padding: '0.6rem 1rem', margin: '0.75rem 0', letterSpacing: '0.03em', lineHeight: 1.7 }}>
      {children}
    </div>
  )
}

/* ── 예제 계산 박스 ────────────────────────────────────── */
function CalcBox({ steps }: { steps: { label: string; value: string; note?: string }[] }) {
  return (
    <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', padding: '0.3rem 0', borderBottom: i < steps.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--tx2)', minWidth: 140 }}>{s.label}</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: 'var(--green)', fontWeight: 600 }}>{s.value}</span>
          {s.note && <span style={{ fontSize: '0.68rem', color: 'var(--tx3)', fontFamily: 'JetBrains Mono' }}>{s.note}</span>}
        </div>
      ))}
    </div>
  )
}

/* ── 인터랙티브 데모 ────────────────────────────────────── */
function InteractiveDemo() {
  const [p, setP] = useState(7)
  const [q, setQ] = useState(11)

  const vP = isPrime(p) && p >= 2 && p <= 97
  const vQ = isPrime(q) && q >= 2 && q <= 97 && q !== p
  const ok = vP && vQ
  const n    = ok ? p * q : 0
  const phi  = ok ? eulerPhi(p, q) : 0
  const eList = ok ? [3,5,7,11,13,17,19,23].filter(e => e < phi && modInverse(e,phi) !== null) : []
  const [eIdx, setEIdx] = useState(0)
  const e = eList[Math.min(eIdx, eList.length-1)] ?? 0
  const d = ok && e ? (modInverse(e,phi) ?? 0) : 0
  const m = ok && n > 3 ? 42 % (n-1) + 1 : 2
  const c = ok && e && n ? modPow(m,e,n) : 0
  const dec = ok && d && n ? modPow(c,d,n) : 0

  const inp: React.CSSProperties = { width:'4.5rem', padding:'0.35rem 0.5rem', background:'var(--bg-input)', border:'1px solid var(--cyan)', color:'var(--green)', fontFamily:'JetBrains Mono', fontSize:'0.95rem', outline:'none', textAlign:'center' }

  return (
    <div className="hud" style={{ padding:'1.5rem' }}>
      <div className="panel-tag">실시간 RSA 계산기 — 값을 바꿔보세요</div>
      <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'1.25rem', alignItems:'center' }}>
        <label style={{ fontSize:'0.8rem', color:'var(--tx2)' }}>
          p (소수) &nbsp;<input type="number" value={p} min={2} max={97} onChange={e=>setP(+e.target.value)} style={{...inp, borderColor: vP?'var(--cyan)':'var(--mag)'}} />
          {!vP && <span style={{color:'var(--mag)',fontSize:'0.62rem',marginLeft:4}}>소수 아님</span>}
        </label>
        <label style={{ fontSize:'0.8rem', color:'var(--tx2)' }}>
          q (소수, ≠p) &nbsp;<input type="number" value={q} min={2} max={97} onChange={e=>setQ(+e.target.value)} style={{...inp, borderColor: vQ?'var(--cyan)':'var(--mag)'}} />
          {!vQ && <span style={{color:'var(--mag)',fontSize:'0.62rem',marginLeft:4}}>오류</span>}
        </label>
        {ok && eList.length > 0 && (
          <label style={{ fontSize:'0.8rem', color:'var(--tx2)' }}>
            e 선택 &nbsp;
            <select value={eIdx} onChange={e=>setEIdx(+e.target.value)} style={{ background:'var(--bg-input)', border:'1px solid var(--cyan)', color:'var(--green)', fontFamily:'JetBrains Mono', padding:'0.35rem 0.5rem', outline:'none' }}>
              {eList.map((v,i)=><option key={v} value={i}>{v}</option>)}
            </select>
          </label>
        )}
      </div>

      {ok ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          {[
            { label:'공개키 생성', rows:[
              {label:'n = p × q', value:`${p} × ${q} = ${n}`},
              {label:'공개키 (n, e)', value:`(${n}, ${e})`, note:'← 이것만 공개'},
            ]},
            {label:'개인키 계산', rows:[
              {label:'φ(n) = (p−1)(q−1)', value:`(${p-1}) × (${q-1}) = ${phi}`},
              {label:`d : ${e}×d ≡ 1 (mod ${phi})`, value:`d = ${d}`, note:'← 절대 비공개'},
            ]},
            {label:'암호화 (공개키 사용)', rows:[
              {label:'평문 m', value:String(m)},
              {label:`c = m^e mod n`, value:`${m}^${e} mod ${n} = ${c}`, note:'← 전송'},
            ]},
            {label:'복호화 (개인키 사용)', rows:[
              {label:`m = c^d mod n`, value:`${c}^${d} mod ${n} = ${dec}`},
              {label:'결과', value:`${dec} ${dec===m?'= 원본 ✅':'≠ 오류 ❌'}`, note:''},
            ]},
          ].map(section=>(
            <div key={section.label}>
              <div style={{fontSize:'0.6rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--tx3)',marginBottom:'0.4rem'}}>{section.label}</div>
              <CalcBox steps={section.rows} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', color:'var(--tx3)', fontFamily:'JetBrains Mono', fontSize:'0.8rem', padding:'1.5rem' }}>
          유효한 소수 p, q를 입력하세요 (2~97, p≠q)
        </div>
      )}
    </div>
  )
}

/* ── 4단계 계산 가이드 ─────────────────────────────────── */
const EXAMPLE = { p:7, q:11, n:77, e:13, phi:60, d:37, m:42, c:14 }

function StepGuide() {
  const [open, setOpen] = useState<number | null>(0)

  const steps = [
    {
      num:'01', title:'소인수분해', color:'var(--step1)',
      formula:'n = p × q   (p, q 는 소수)',
      what: 'RSA에서 공개키 n은 두 소수를 곱해 만듭니다. 해독하려면 그 두 소수를 역으로 찾아야 합니다.',
      how: [
        '① 100 이하의 소수 목록을 참고하세요: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ...',
        '② 소수 중 n을 나누어 떨어지게 하는 p를 찾으세요 (√n 까지만 시도)',
        '③ q = n ÷ p 로 계산합니다',
        '④ 두 값 모두 소수인지 확인 후 제출',
      ],
      example: [
        {label:'n =', value:'77'},
        {label:'√77 ≈', value:'8.7  →  2~8 범위 소수 시도'},
        {label:'77 ÷ 7 =', value:'11  (딱 나누어짐!)'},
        {label:'7 소수? 11 소수?', value:'✅ 둘 다 소수  →  p=7, q=11'},
      ],
      tip:'게임에서 소수 테이블을 클릭하면 자동으로 입력됩니다.',
    },
    {
      num:'02', title:'오일러 피 함수 φ(n)', color:'var(--step2)',
      formula:'φ(n) = (p − 1) × (q − 1)',
      what: 'φ(n)은 n보다 작고 n과 서로소인 자연수의 개수입니다. 개인키 d를 계산하는 데 필수 값입니다.',
      how: [
        '① Step 1에서 구한 p, q를 사용합니다',
        '② 공식에 대입: φ(n) = (p−1) × (q−1)',
        '③ 단순 뺄셈과 곱셈만으로 계산 가능합니다',
      ],
      example: [
        {label:'p = 7, q = 11', value:''},
        {label:'p − 1 =', value:'6'},
        {label:'q − 1 =', value:'10'},
        {label:'φ(n) = 6 × 10 =', value:'60'},
      ],
      tip:'beginner 난이도는 이 값을 자동으로 알려줍니다. "다음 단계" 버튼을 누르세요.',
    },
    {
      num:'03', title:'개인키 d 계산', color:'var(--step3)',
      formula:'e × d ≡ 1  (mod φ(n))',
      what: 'e와 d는 mod φ(n) 에서 서로 곱하면 1이 되는 관계입니다. d를 "e의 모듈러 역원"이라 부릅니다.',
      how: [
        '① e × d = k × φ(n) + 1  형태의 d를 찾습니다 (k=1,2,3...)',
        '② 직접 계산: d = 1, 2, 3 ... 대입해 e×d mod φ(n) = 1 인 값 탐색',
        '③ 또는 게임 계산기: e 입력 → × → d 후보 → mod → φ(n) → = 로 확인',
        '④ beginner/easy는 보기에서 선택하면 됩니다',
      ],
      example: [
        {label:'e = 13, φ(n) = 60', value:''},
        {label:'13 × 1 mod 60 =', value:'13  ✗'},
        {label:'13 × 2 mod 60 =', value:'26  ✗'},
        {label:'13 × 37 mod 60 =', value:'481 mod 60 = 1  ✅  →  d = 37'},
      ],
      tip:'힌트 사용 시 보기 선택지가 줄어듭니다. 틀린 보기는 취소선이 그어집니다.',
    },
    {
      num:'04', title:'복호화', color:'var(--step4)',
      formula:'m = c^d  mod  n',
      what: '암호문 c에 개인키 d를 지수로 올리고 n으로 나눈 나머지가 원래 메시지 m입니다.',
      how: [
        '① 계산기 버튼을 클릭해서 열기',
        '② 암호문 c 입력',
        '③ pow 버튼 클릭',
        '④ 개인키 d 입력',
        '⑤ mod 버튼 클릭',
        '⑥ n 입력 → = 버튼',
        '⑦ "→ STEP 4" 버튼으로 결과를 자동 입력',
      ],
      example: [
        {label:'c = 14, d = 37, n = 77', value:''},
        {label:'14^37 mod 77', value:'계산기로 계산'},
        {label:'결과 =', value:`${modPow(EXAMPLE.c, EXAMPLE.d, EXAMPLE.n)}  ← 원본 메시지 m`},
      ],
      tip:'계산기의 pow는 BigInt로 계산하므로 숫자가 아무리 커도 정확합니다.',
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ background:'var(--bg-card)', border:`1px solid ${open===i ? s.color : 'var(--border)'}`, transition:'border-color 0.2s', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, width:'3px', height:'100%', background: s.color }} />
          <button
            onClick={() => setOpen(open===i ? null : i)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem 1rem 1.5rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
          >
            <span style={{ fontFamily:'Rajdhani', fontSize:'1.5rem', fontWeight:700, color:s.color, minWidth:'2.5rem' }}>
              {s.num}
            </span>
            <div style={{ flex:1 }}>
              <span style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)' }}>{s.title}</span>
              <span style={{ fontFamily:'JetBrains Mono', fontSize:'0.75rem', color:'var(--green)', marginLeft:'1rem', opacity:0.7 }}>{s.formula}</span>
            </div>
            <span style={{ color:'var(--tx3)', fontSize:'0.8rem' }}>{open===i ? '▲' : '▼'}</span>
          </button>

          {open === i && (
            <div style={{ padding:'0 1.5rem 1.5rem' }}>
              <FormulaBox color={s.color}>{s.formula}</FormulaBox>

              <p style={{ fontSize:'0.8rem', color:'var(--tx2)', lineHeight:1.8, marginBottom:'1rem' }}>{s.what}</p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div>
                  <div style={{ fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.5rem' }}>계산 방법</div>
                  <ol style={{ paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {s.how.map((h,j) => (
                      <li key={j} style={{ fontSize:'0.75rem', color:'var(--tx2)', lineHeight:1.6 }}>{h}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <div style={{ fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.5rem' }}>예제 (n=77)</div>
                  <CalcBox steps={s.example} />
                </div>
              </div>

              <div style={{ marginTop:'0.75rem', padding:'0.5rem 0.75rem', background:'rgba(255,187,0,0.07)', border:'1px solid rgba(255,187,0,0.2)', fontSize:'0.72rem', color:'var(--warn)', lineHeight:1.6 }}>
                💡 {s.tip}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── 메인 페이지 ────────────────────────────────────────── */
export default function LearnPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <NavBar />
      <main style={{ maxWidth:900, margin:'0 auto', padding:'6rem 1.5rem 4rem' }}>

        {/* ── 0. RSA 전체 식 ────────────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 00 — WHAT IS RSA" title="RSA 암호란" accent="무엇인가?" />

          {/* RSA 완전 공식 박스 */}
          <div style={{ background:'var(--bg-card)', border:'2px solid rgba(0,212,255,0.4)', padding:'1.75rem', marginBottom:'2rem', boxShadow:'0 0 32px rgba(0,212,255,0.07)' }}>
            <div style={{ textAlign:'center', fontFamily:'Rajdhani', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--cyan)', marginBottom:'1.5rem' }}>
              RSA 완전 공식 — 1977년 Rivest · Shamir · Adleman
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'0' }}>
              {/* 키 생성 */}
              <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.6rem' }}>
                  STEP 1 — 키 생성 (Key Generation)
                </div>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.85rem', color:'var(--green)', lineHeight:2.3 }}>
                  <span style={{color:'var(--tx3)', fontSize:'0.72rem', display:'inline-block', minWidth:180}}>두 소수 선택</span>
                  <strong>p, q</strong> &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: p=61, q=53)</span><br/>
                  <span style={{color:'var(--tx3)', fontSize:'0.72rem', display:'inline-block', minWidth:180}}>공개값</span>
                  <strong>n = p × q</strong> &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: 61×53 = 3233)</span><br/>
                  <span style={{color:'var(--tx3)', fontSize:'0.72rem', display:'inline-block', minWidth:180}}>보조값</span>
                  <strong>φ(n) = (p−1)(q−1)</strong> &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: 60×52 = 3120)</span><br/>
                  <span style={{color:'var(--tx3)', fontSize:'0.72rem', display:'inline-block', minWidth:180}}>공개키 e 선택</span>
                  <strong>gcd(e, φ(n)) = 1</strong> &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: e=17)</span><br/>
                  <span style={{color:'var(--tx3)', fontSize:'0.72rem', display:'inline-block', minWidth:180}}>개인키 d 계산</span>
                  <strong style={{color:'var(--warn)'}}>e × d ≡ 1 (mod φ(n))</strong> &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: d=2753)</span>
                </div>
                <div style={{ display:'flex', gap:'2rem', marginTop:'0.6rem', fontFamily:'JetBrains Mono', fontSize:'0.73rem' }}>
                  <span style={{color:'var(--cyan)'}}>📢 공개키: <strong>(n=3233, e=17)</strong></span>
                  <span style={{color:'var(--mag)'}}>🔒 개인키: <strong>(n=3233, d=2753)</strong></span>
                </div>
              </div>

              {/* 암호화 + 복호화 */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                <div style={{ padding:'1rem 1.25rem', borderRight:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.6rem' }}>
                    STEP 2 — 암호화
                  </div>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--warn)', lineHeight:2.1 }}>
                    평문: <strong>m</strong> &nbsp;<span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(예: m=65)</span><br/>
                    <strong style={{fontSize:'1.1rem'}}>c = m<sup>e</sup> mod n</strong><br/>
                    <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>65<sup>17</sup> mod 3233 = 2790</span>
                  </div>
                  <div style={{ marginTop:'0.5rem', fontSize:'0.7rem', color:'var(--tx3)' }}>공개키 e로 잠금 → 누구나 암호화 가능</div>
                </div>
                <div style={{ padding:'1rem 1.25rem' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.6rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--tx3)', marginBottom:'0.6rem' }}>
                    STEP 3 — 복호화
                  </div>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)', lineHeight:2.1 }}>
                    암호문: <strong>c</strong> &nbsp;<span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>(c=2790)</span><br/>
                    <strong style={{fontSize:'1.1rem'}}>m = c<sup>d</sup> mod n</strong><br/>
                    <span style={{color:'var(--tx3)', fontSize:'0.7rem'}}>2790<sup>2753</sup> mod 3233 = 65</span>
                  </div>
                  <div style={{ marginTop:'0.5rem', fontSize:'0.7rem', color:'var(--tx3)' }}>개인키 d로만 열기 → 수신자만 복호화 가능</div>
                </div>
              </div>

              {/* 핵심 원리 */}
              <div style={{ padding:'0.85rem 1.25rem', borderTop:'1px solid var(--border)', background:'rgba(255,45,120,0.05)' }}>
                <span style={{ fontSize:'0.73rem', color:'var(--tx2)', lineHeight:1.7, fontFamily:'JetBrains Mono' }}>
                  🔐 <strong style={{color:'var(--mag)'}}>보안의 핵심:</strong> &nbsp;
                  n=3233에서 p=61, q=53을 역으로 찾으려면(소인수분해) 2048비트 실전에서는 현존 최고 컴퓨터로 수천 년이 걸립니다.
                  d를 모르면 복호화 불가능 — 이것이 RSA의 안전성입니다.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { icon:'🔑', title:'공개키 암호', desc:'암호화 키(공개키)와 복호화 키(개인키)가 다릅니다. 공개키는 누구나 알아도 되고, 개인키는 본인만 알아야 합니다.' },
              { icon:'🔢', title:'소인수분해의 어려움', desc:'두 소수의 곱 n은 쉽게 계산되지만, n에서 원래 두 소수를 역으로 찾는 것은 수백 자리 수에서 수천 년이 걸립니다.' },
              { icon:'🌐', title:'실생활 사용', desc:'HTTPS, 이메일 암호화, 전자서명 등 인터넷 보안의 핵심 기술입니다. 당신이 지금 보는 이 페이지도 RSA 기반으로 보호됩니다.' },
              { icon:'🎮', title:'이 게임에서는', desc:'실제 RSA는 2048비트 이상의 수를 사용하지만, 이 게임은 97 이하의 소수로 원리를 학습합니다. 수학 원리는 완전히 동일합니다.' },
            ].map(c => (
              <div key={c.title} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', padding:'1.25rem', position:'relative' }}>
                <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', background:'var(--cyan)' }} />
                <div style={{ paddingLeft:'0.5rem' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>{c.icon}</div>
                  <div style={{ fontFamily:'Rajdhani', fontSize:'0.9rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--cyan)', marginBottom:'0.4rem' }}>{c.title}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--tx2)', lineHeight:1.75 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* RSA 동작 흐름 */}
          <div className="hud" style={{ padding:'1.25rem' }}>
            <div className="panel-tag">RSA 기본 동작 흐름</div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', fontFamily:'JetBrains Mono', fontSize:'0.78rem' }}>
              {[
                { box:'p, q 선택\n(두 소수)', color:'var(--step1)' },
                { arrow:'→' },
                { box:'n = p×q\nφ(n) 계산', color:'var(--step2)' },
                { arrow:'→' },
                { box:'e, d 선택\n(공개·개인키)', color:'var(--step3)' },
                { arrow:'→' },
                { box:'c = m^e mod n\n암호화', color:'var(--warn)' },
                { arrow:'→' },
                { box:'m = c^d mod n\n복호화', color:'var(--step4)' },
              ].map((item, i) => 'arrow' in item ? (
                <span key={i} style={{ color:'var(--tx3)', fontSize:'1.2rem' }}>{item.arrow}</span>
              ) : (
                <div key={i} style={{ padding:'0.6rem 0.8rem', background:`${item.color}14`, border:`1px solid ${item.color}44`, color:item.color, textAlign:'center', whiteSpace:'pre-line', lineHeight:1.5, fontSize:'0.7rem' }}>
                  {item.box}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 1. 4단계 계산 가이드 ─────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 01 — HOW TO SOLVE" title="단계별 계산" accent="방법" />
          <div style={{ padding:'0.75rem 1rem', background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', fontSize:'0.75rem', color:'var(--tx2)', marginBottom:'1.5rem', lineHeight:1.7 }}>
            📌 모든 예제는 <strong style={{ color:'var(--cyan)' }}>p=7, q=11, n=77, e=13</strong> 기준입니다. 각 단계를 클릭해 계산 방법과 예시를 확인하세요.
          </div>
          <StepGuide />
        </section>

        {/* ── 2. 인터랙티브 계산기 ─────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 02 — TRY IT YOURSELF" title="직접" accent="계산해보기" />
          <p style={{ fontSize:'0.8rem', color:'var(--tx2)', marginBottom:'1.25rem', lineHeight:1.8 }}>
            p와 q 값을 바꾸면 RSA 전체 계산이 실시간으로 업데이트됩니다.
          </p>
          <InteractiveDemo />
        </section>

        {/* ── 3. 계산기 사용법 ─────────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 03 — CALCULATOR GUIDE" title="인게임 계산기" accent="사용법" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="hud" style={{ padding:'1.25rem' }}>
              <div className="panel-tag">Step 3 — d 계산</div>
              <FormulaBox>e × d mod φ(n) = 1 확인 방법</FormulaBox>
              <ol style={{ paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.4rem', fontSize:'0.75rem', color:'var(--tx2)' }}>
                <li>계산기에 <strong style={{color:'var(--green)'}}>e</strong> 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>×</strong> 버튼</li>
                <li>후보 <strong style={{color:'var(--green)'}}>d</strong> 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>mod</strong> 버튼</li>
                <li><strong style={{color:'var(--green)'}}>φ(n)</strong> 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>=</strong> → 결과가 <strong style={{color:'var(--green)'}}>1</strong>이면 정답</li>
              </ol>
            </div>
            <div className="hud" style={{ padding:'1.25rem' }}>
              <div className="panel-tag">Step 4 — 복호화 계산</div>
              <FormulaBox>c ^ d mod n</FormulaBox>
              <ol style={{ paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.4rem', fontSize:'0.75rem', color:'var(--tx2)' }}>
                <li>계산기에 <strong style={{color:'var(--green)'}}>c</strong> (암호문) 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>pow</strong> 버튼</li>
                <li><strong style={{color:'var(--green)'}}>d</strong> (개인키) 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>mod</strong> 버튼</li>
                <li><strong style={{color:'var(--green)'}}>n</strong> 입력</li>
                <li><strong style={{color:'var(--cyan)'}}>=</strong> → <strong style={{color:'var(--mag)'}}>→ STEP 4</strong> 버튼으로 자동 입력</li>
              </ol>
            </div>
          </div>
        </section>

        {/* ── 4. mod 계산법 ────────────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 04 — MOD ARITHMETIC" title="mod 계산법" accent="완전 정복" />

          {/* mod 개념 */}
          <div style={{ padding:'1.25rem', background:'var(--bg-card)', border:'1px solid rgba(0,212,255,0.2)', marginBottom:'1.25rem' }}>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:'var(--cyan)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
              mod란?
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--tx2)', lineHeight:1.85, marginBottom:'0.75rem' }}>
              <strong style={{ color:'var(--tx)' }}>a mod n</strong>은 a를 n으로 나눴을 때의 <strong style={{ color:'var(--green)' }}>나머지</strong>입니다.
              시계를 생각하면 쉽습니다 — 12시 이후는 다시 1, 2, 3 ... 으로 돌아가죠? mod도 똑같습니다.
            </p>
            <FormulaBox>a mod n = a를 n으로 나눈 나머지</FormulaBox>
          </div>

          {/* 기본 계산법 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', padding:'1.25rem' }}>
              <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--cyan)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
                기본 예시
              </div>
              <CalcBox steps={[
                { label:'17 mod 5', value:'2', note:'17 = 3×5 + 2  →  나머지 2' },
                { label:'20 mod 6', value:'2', note:'20 = 3×6 + 2  →  나머지 2' },
                { label:'13 mod 7', value:'6', note:'13 = 1×7 + 6  →  나머지 6' },
                { label:'15 mod 5', value:'0', note:'15 = 3×5 + 0  →  나머지 0' },
              ]} />
            </div>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', padding:'1.25rem' }}>
              <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--step3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
                계산 순서
              </div>
              <ol style={{ paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem', fontSize:'0.78rem', color:'var(--tx2)', lineHeight:1.7 }}>
                <li>① 앞 숫자 ÷ 뒤 숫자 = <strong style={{color:'var(--green)'}}>몫</strong> (소수점 버림)</li>
                <li>② 앞 숫자 − (몫 × 뒤 숫자) = <strong style={{color:'var(--green)'}}>나머지</strong></li>
                <li>③ 그 나머지가 mod의 결과!</li>
              </ol>
              <div style={{ marginTop:'0.75rem', fontFamily:'JetBrains Mono', fontSize:'0.75rem', color:'var(--green)', background:'rgba(0,255,136,0.05)', padding:'0.5rem 0.75rem', borderLeft:'2px solid var(--green)' }}>
                481 mod 60<br/>
                → 481 ÷ 60 = 8 (몫)<br/>
                → 481 − 8×60 = 481 − 480 = <strong>1</strong>
              </div>
            </div>
          </div>

          {/* Step 3 d 계산에서의 mod */}
          <div style={{ background:'var(--bg-card)', border:'1px solid rgba(245,158,11,0.3)', padding:'1.25rem', marginBottom:'1rem' }}>
            <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--step3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
              Step 3에서 mod 사용 — e×d mod φ(n) = 1 만족하는 d 찾기
            </div>
            <p style={{ fontSize:'0.78rem', color:'var(--tx2)', lineHeight:1.8, marginBottom:'0.75rem' }}>
              e=13, φ(n)=60일 때 d를 찾는 법: d=1부터 하나씩 대입해서 <strong style={{color:'var(--green)'}}>13×d mod 60 = 1</strong>이 되는 d를 찾습니다.
            </p>
            <CalcBox steps={[
              { label:'13×1 mod 60', value:'13', note:'❌' },
              { label:'13×2 mod 60', value:'26', note:'❌' },
              { label:'13×3 mod 60', value:'39', note:'❌' },
              { label:'13×4 mod 60', value:'52', note:'❌' },
              { label:'13×37 mod 60', value:'1', note:'✅ d = 37 정답!' },
            ]} />
            <div style={{ marginTop:'0.75rem', fontSize:'0.72rem', color:'var(--warn)', padding:'0.5rem 0.75rem', background:'rgba(255,187,0,0.07)', borderLeft:'2px solid var(--warn)' }}>
              💡 게임 계산기에서: e 입력 → × → d 후보 → mod → φ(n) → = → 결과가 1이면 정답!
            </div>
          </div>

          {/* Step 4 복호화에서의 mod */}
          <div style={{ background:'var(--bg-card)', border:'1px solid rgba(16,185,129,0.3)', padding:'1.25rem' }}>
            <div style={{ fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, color:'var(--step4)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
              Step 4에서 mod 사용 — c^d mod n 복호화
            </div>
            <p style={{ fontSize:'0.78rem', color:'var(--tx2)', lineHeight:1.8, marginBottom:'0.75rem' }}>
              큰 수의 거듭제곱 mod는 <strong style={{color:'var(--green)'}}>반복 제곱법</strong>으로 계산합니다.
              중간마다 mod를 취해서 숫자가 커지는 걸 막습니다.
            </p>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.75rem', color:'var(--green)', background:'rgba(0,255,136,0.05)', borderLeft:'2px solid var(--step4)', padding:'0.6rem 0.9rem', lineHeight:2.0 }}>
              예: 14^37 mod 77 계산<br/>
              14^1 mod 77 = 14<br/>
              14^2 mod 77 = 196 mod 77 = 42<br/>
              14^4 mod 77 = 42^2 mod 77 = 1764 mod 77 = 42<br/>
              14^8 mod 77 = 42^2 mod 77 = 42 …<br/>
              ⟶ <strong>게임 계산기를 사용</strong>하면 자동 계산됩니다!
            </div>
            <div style={{ marginTop:'0.75rem', fontSize:'0.72rem', color:'var(--warn)', padding:'0.5rem 0.75rem', background:'rgba(255,187,0,0.07)', borderLeft:'2px solid var(--warn)' }}>
              💡 게임 계산기에서: c 입력 → pow → d → mod → n → = → "→ STEP 4" 버튼으로 자동 입력!
            </div>
          </div>
        </section>

        {/* ── 5. 소수 테이블 ───────────────────────────── */}
        <section style={{ marginBottom:'4rem' }}>
          <SectionHead tag="// 05 — REFERENCE" title="소수" accent="참조 테이블" />
          <p style={{ fontSize:'0.78rem', color:'var(--tx2)', marginBottom:'1rem' }}>
            게임 중 이 페이지를 다른 탭에 열어두고 참조하세요. Hard/Expert 난이도에서는 97 이하 모든 소수가 사용됩니다.
          </p>
          <PrimeTable max={97} />
          <div style={{ marginTop:'0.75rem', fontSize:'0.68rem', color:'var(--tx3)', fontFamily:'JetBrains Mono' }}>
            총 {[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97].length}개 소수 (2 ~ 97)
          </div>
        </section>

        {/* ── 5. 난이도별 팁 ──────────────────────────── */}
        <section style={{ marginBottom:'3rem' }}>
          <SectionHead tag="// 05 — TIPS" title="난이도별" accent="공략 팁" />
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {[
              { d:'BEGINNER', color:'var(--step1)', tip:'소수 테이블에서 클릭 선택 → φ(n) 자동 제공 → d 보기 3개 중 선택 → 계산기로 복호화' },
              { d:'EASY',     color:'var(--step2)', tip:'p 힌트 제공 → φ(n) 공식 빈칸 채우기 → d 보기 5개 중 선택 → 계산기 활용' },
              { d:'MEDIUM',   color:'var(--step3)', tip:'자유 입력 + 힌트 1회. 소수 테이블 암기 필수. 180초 제한. 오답 시 -20초' },
              { d:'HARD',     color:'var(--mag)',   tip:'힌트 없음. 소수 테이블 완전 암기. 120초. 확장 유클리드 직접 계산' },
              { d:'EXPERT',   color:'#ff4444',      tip:'힌트 없음. 90초. 오답 시 -30초. 모든 계산을 머릿속으로 빠르게' },
            ].map(item => (
              <div key={item.d} style={{ display:'flex', gap:'1rem', alignItems:'center', padding:'0.75rem 1rem', background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                <span style={{ fontFamily:'Rajdhani', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.15em', color:item.color, minWidth:70 }}>{item.d}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--tx2)', lineHeight:1.6 }}>{item.tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign:'center', padding:'2rem', background:'var(--bg-panel)', border:'1px solid var(--border)' }}>
          <div style={{ fontFamily:'Rajdhani', fontSize:'1.2rem', fontWeight:700, color:'var(--tx)', marginBottom:'1rem' }}>
            준비가 됐나요? 미션을 시작하세요.
          </div>
          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/stage')} style={{ padding:'0.75rem 2rem', background:'var(--cyan)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.95rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
              ▶ STAGE 시작
            </button>
            <button onClick={() => navigate('/')} style={{ padding:'0.75rem 1.5rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', fontSize:'0.9rem', cursor:'pointer' }}>
              HOME
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
