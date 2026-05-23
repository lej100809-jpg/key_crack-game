import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelChar from '@/components/ui/PixelChar'
import PixelIcon from '@/components/ui/PixelIcon'
import { useTutorialStore } from '@/store/useTutorialStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { isPrime } from '@/lib/rsa'

// ─── 튜토리얼 고정 퍼즐 ─────────────────────────────────────
const PUZZLE = { n:21, e:5, c:16 }
const ANSWER = { p:3, q:7, phi:12, d:5, m:4 }

// ─── 대화 타이핑 훅 ──────────────────────────────────────────
function useTyping(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

// ─── 대화 박스 ───────────────────────────────────────────────
function DialogBox({ speaker, text, onNext, isLast = false, skinId = 'skin_ghost' }: {
  speaker: string; text: string; onNext: () => void; isLast?: boolean; skinId?: string
}) {
  const typed = useTyping(text)
  const done  = typed.length >= text.length

  return (
    <div
      style={{ display:'flex', gap:'1rem', alignItems:'flex-end', cursor: done ? 'pointer' : 'default' }}
      onClick={() => done && onNext()}
    >
      <div style={{ flexShrink:0, filter:'drop-shadow(0 0 8px var(--cyan-dim))' }}>
        <PixelChar skinId={skinId} scale={4} />
      </div>
      <div style={{
        flex:1, background:'var(--bg-panel)',
        border:'1px solid var(--cyan)', padding:'1.25rem 1.5rem',
        position:'relative', minHeight:90,
      }}>
        {/* 말풍선 꼬리 */}
        <div style={{
          position:'absolute', left:-10, bottom:20,
          width:0, height:0,
          borderTop:'8px solid transparent',
          borderBottom:'8px solid transparent',
          borderRight:'10px solid var(--cyan)',
        }} />
        <div style={{ fontFamily:'Rajdhani', fontSize:'0.75rem', fontWeight:700, color:'var(--cyan)', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.4rem' }}>
          {speaker}
        </div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.82rem', color:'var(--tx)', lineHeight:1.75 }}>
          {typed}
          {!done && <span style={{ animation:'blink 0.6s infinite' }}>▌</span>}
        </div>
        {done && (
          <div style={{ position:'absolute', bottom:10, right:14, fontSize:'0.6rem', color:'var(--tx3)', letterSpacing:'0.15em', animation:'blink 1.2s infinite' }}>
            {isLast ? '[ ENTER ]' : '[ 다음 ▶ ]'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 인터랙티브 스텝 ─────────────────────────────────────────
function StepCard({ step, color, title, formula, children }: {
  step: number; color: string; title: string; formula: string; children: React.ReactNode
}) {
  return (
    <div style={{ background:'var(--bg-card)', border:`1px solid ${color}55`, padding:'1.25rem', position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, width:3, height:'100%', background:color }} />
      <div style={{ paddingLeft:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
          <span style={{ fontFamily:'Rajdhani', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.2em', color, background:`${color}18`, padding:'0.15rem 0.55rem', border:`1px solid ${color}44` }}>
            STEP 0{step}
          </span>
          <span style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:'var(--tx)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{title}</span>
        </div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.88rem', color:'var(--green)', background:'rgba(0,255,136,0.05)', borderLeft:`2px solid ${color}`, padding:'0.35rem 0.75rem', marginBottom:'0.9rem' }}>
          {formula}
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── 입력창 ──────────────────────────────────────────────────
function TutInput({ value, onChange, placeholder, correct, wrong, width = '5rem' }: {
  value:string; onChange:(v:string)=>void; placeholder:string; correct:boolean; wrong:boolean; width?:string
}) {
  const border = correct ? 'var(--green)' : wrong ? 'var(--mag)' : 'var(--cyan)'
  return (
    <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width, padding:'0.4rem 0.6rem', background:'var(--bg-input)', border:`1px solid ${border}`, color:'var(--green)', fontFamily:'JetBrains Mono', fontSize:'0.9rem', outline:'none', textAlign:'center', transition:'border-color 0.2s' }} />
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────

type Scene = 'intro' | 'story' | 'concept' | 'puzzle' | 'complete'

const STORY_DIALOGS = [
  { speaker:'COMMANDER', text:'요원, 잘 들어라. 우리는 방금 적 조직의 암호화된 통신을 가로챘다.', skin:'skin_ghost' },
  { speaker:'COMMANDER', text:'이 메시지를 해독하려면 RSA 암호 체계를 이해해야 한다. 훈련을 시작하겠다.', skin:'skin_ghost' },
  { speaker:'COMMANDER', text:'RSA는 두 소수를 곱해 만든 n, 그리고 암호화 키 e로 이루어진다. 메시지를 암호화할 때는 m^e mod n을 계산한다.', skin:'skin_ghost' },
  { speaker:'COMMANDER', text:'해독하려면 n을 소인수분해해서 개인키 d를 찾아야 한다. 그 d로 c^d mod n을 계산하면 원본 메시지가 나온다.', skin:'skin_ghost' },
  { speaker:'COMMANDER', text:'자, 지금부터 실전 훈련이다. 테스트 암호문이 준비됐다. 단계별로 따라와.', skin:'skin_ghost' },
]

export default function TutorialPage() {
  const navigate  = useNavigate()
  const { complete, skip } = useTutorialStore()
  const addCoins  = usePlayerStore(s => s.addCoins)
  const addBadge  = usePlayerStore(s => s.addBadge)

  const [scene,       setScene]      = useState<Scene>('intro')
  const [dialogIdx,   setDialogIdx]  = useState(0)
  const [bootText,    setBootText]   = useState('')

  // 퍼즐 상태
  const [p, setP] = useState(''); const [q, setQ] = useState('')
  const [phi, setPhi] = useState('')
  const [d, setD] = useState('')
  const [m, setM] = useState('')
  const [step1Done, setStep1Done] = useState(false)
  const [step2Done, setStep2Done] = useState(false)
  const [step3Done, setStep3Done] = useState(false)
  const [step4Done, setStep4Done] = useState(false)
  const [err1, setErr1] = useState(''); const [err2, setErr2] = useState('')
  const [err3, setErr3] = useState(''); const [err4, setErr4] = useState('')

  // 부팅 애니메이션
  useEffect(() => {
    if (scene !== 'intro') return
    const lines = [
      'KEY CRACK v1.0 초기화 중...',
      '암호 해독 프로토콜 로드 완료',
      '요원 식별 확인 중...',
      '튜토리얼 모드 시작',
    ]
    let idx = 0, text = ''
    const id = setInterval(() => {
      if (idx < lines.length) { text += (idx > 0 ? '\n' : '') + '> ' + lines[idx++]; setBootText(text) }
      else { clearInterval(id); setTimeout(() => setScene('story'), 800) }
    }, 500)
    return () => clearInterval(id)
  }, [scene])

  function nextDialog() {
    if (dialogIdx < STORY_DIALOGS.length - 1) setDialogIdx(i => i + 1)
    else setScene('concept')
  }

  function handleSkip() { skip(); navigate('/') }

  function checkStep1() {
    const pn = parseInt(p), qn = parseInt(q)
    if (!isPrime(pn) || !isPrime(qn)) { setErr1('두 값 모두 소수여야 합니다.'); return }
    if (pn * qn !== PUZZLE.n) { setErr1(`${pn} × ${qn} = ${pn*qn} ≠ ${PUZZLE.n}`); return }
    setErr1(''); setStep1Done(true)
  }
  function checkStep2() {
    if (parseInt(phi) !== ANSWER.phi) { setErr2(`(${ANSWER.p}-1) × (${ANSWER.q}-1) = ${ANSWER.phi}`); return }
    setErr2(''); setStep2Done(true)
  }
  function checkStep3() {
    const dn = parseInt(d)
    if ((BigInt(PUZZLE.e) * BigInt(dn)) % BigInt(ANSWER.phi) !== 1n) { setErr3(`${PUZZLE.e} × ${d} mod ${ANSWER.phi} ≠ 1`); return }
    setErr3(''); setStep3Done(true)
  }
  function checkStep4() {
    if (parseInt(m) !== ANSWER.m) { setErr4(`c^d mod n = ${PUZZLE.c}^${ANSWER.d} mod ${PUZZLE.n} = ${ANSWER.m}`); return }
    setErr4(''); setStep4Done(true)
    setTimeout(() => setScene('complete'), 600)
  }

  function finish() {
    complete()
    addCoins(200)
    addBadge('badge_tutorial')
    navigate('/stage')
  }

  // ── 부팅 화면 ──────────────────────────────────────────────
  if (scene === 'intro') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2rem' }}>
      <div style={{ fontFamily:'Rajdhani', fontSize:'clamp(3rem,8vw,7rem)', fontWeight:700, letterSpacing:'0.3em', color:'var(--cyan)', textShadow:'0 0 40px var(--cyan-dim)' }}>
        KEY CRACK
      </div>
      <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.78rem', color:'var(--green)', whiteSpace:'pre-line', lineHeight:2, letterSpacing:'0.08em', minHeight:100 }}>
        {bootText}<span style={{ animation:'blink 0.6s infinite' }}>▌</span>
      </div>
      <button onClick={handleSkip} style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', color:'var(--tx3)', background:'transparent', border:'none', cursor:'pointer', letterSpacing:'0.15em' }}>
        튜토리얼 건너뛰기
      </button>
    </div>
  )

  // ── 스토리 대화 ─────────────────────────────────────────────
  if (scene === 'story') {
    const d = STORY_DIALOGS[dialogIdx]
    return (
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'2rem', backgroundImage:'radial-gradient(ellipse at 50% 30%, rgba(0,212,255,0.06) 0%, transparent 60%)' }}>
        <div style={{ maxWidth:780, width:'100%', margin:'0 auto 3rem' }}>
          <DialogBox speaker={d.speaker} text={d.text} skinId={d.skin} onNext={nextDialog} isLast={dialogIdx === STORY_DIALOGS.length-1} />
        </div>
        {/* 진행 도트 */}
        <div style={{ display:'flex', gap:'0.4rem', justifyContent:'center', marginBottom:'1.5rem' }}>
          {STORY_DIALOGS.map((_,i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:'50%', background: i===dialogIdx ? 'var(--cyan)' : 'var(--tx3)', boxShadow: i===dialogIdx ? '0 0 6px var(--cyan)' : 'none', transition:'all 0.3s' }} />
          ))}
        </div>
        <div style={{ textAlign:'center' }}>
          <button onClick={handleSkip} style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', color:'var(--tx3)', background:'transparent', border:'none', cursor:'pointer', letterSpacing:'0.15em' }}>
            건너뛰기
          </button>
        </div>
      </div>
    )
  }

  // ── RSA 개념 설명 ──────────────────────────────────────────
  if (scene === 'concept') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', overflowY:'auto', padding:'2rem' }}>
      <div style={{ maxWidth:760, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', letterSpacing:'0.3em', color:'var(--cyan)', marginBottom:'0.5rem' }}>// RSA 암호 원리</div>
          <h1 style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
            RSA 암호란 무엇인가
          </h1>
        </div>

        {/* RSA 전체 식 */}
        <div style={{ background:'var(--bg-card)', border:'2px solid rgba(0,212,255,0.4)', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 0 24px rgba(0,212,255,0.08)' }}>
          <div style={{ fontFamily:'Rajdhani', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--cyan)', marginBottom:'1.25rem', textAlign:'center' }}>
            RSA 완전 공식
          </div>

          {/* 키 생성 */}
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.62rem', color:'var(--tx3)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'0.5rem' }}>① 키 생성 (Key Generation)</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.85rem', color:'var(--green)', background:'rgba(0,255,136,0.05)', padding:'0.75rem 1rem', lineHeight:2.2, borderLeft:'3px solid var(--cyan)' }}>
              <span style={{color:'var(--tx3)'}}>소수 선택:</span>  p, q &nbsp; (서로 다른 두 소수)<br/>
              <span style={{color:'var(--tx3)'}}>공개값 계산:</span>  n = p × q<br/>
              <span style={{color:'var(--tx3)'}}>보조값 계산:</span>  φ(n) = (p−1) × (q−1)<br/>
              <span style={{color:'var(--tx3)'}}>공개키 선택:</span>  e &nbsp; <span style={{color:'var(--tx3)', fontSize:'0.72rem'}}>[1 &lt; e &lt; φ(n), gcd(e, φ(n)) = 1]</span><br/>
              <span style={{color:'var(--tx3)'}}>개인키 계산:</span>  d &nbsp; <span style={{color:'var(--warn)'}}>e × d ≡ 1 (mod φ(n))</span>
            </div>
            <div style={{ display:'flex', gap:'1.5rem', marginTop:'0.6rem', fontSize:'0.72rem', fontFamily:'JetBrains Mono' }}>
              <div style={{ color:'var(--cyan)' }}>📢 공개키: <strong>(n, e)</strong></div>
              <div style={{ color:'var(--mag)' }}>🔒 개인키: <strong>(n, d)</strong> ← 절대 비공개!</div>
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ height:1, background:'var(--border)', margin:'1rem 0' }} />

          {/* 암호화 + 복호화 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.62rem', color:'var(--tx3)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'0.5rem' }}>② 암호화 (Encryption)</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--warn)', background:'rgba(255,187,0,0.07)', padding:'0.75rem 1rem', borderLeft:'3px solid var(--warn)', lineHeight:2 }}>
                평문: m<br/>
                <strong style={{fontSize:'1.05rem'}}>c = m<sup>e</sup> mod n</strong><br/>
                <span style={{fontSize:'0.7rem', color:'var(--tx3)'}}>공개키 e로 잠금</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.62rem', color:'var(--tx3)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:'0.5rem' }}>③ 복호화 (Decryption)</div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)', background:'rgba(0,255,136,0.07)', padding:'0.75rem 1rem', borderLeft:'3px solid var(--green)', lineHeight:2 }}>
                암호문: c<br/>
                <strong style={{fontSize:'1.05rem'}}>m = c<sup>d</sup> mod n</strong><br/>
                <span style={{fontSize:'0.7rem', color:'var(--tx3)'}}>개인키 d로 열기</span>
              </div>
            </div>
          </div>

          {/* 왜 안전한가 */}
          <div style={{ marginTop:'1rem', padding:'0.6rem 1rem', background:'rgba(255,45,120,0.07)', border:'1px solid rgba(255,45,120,0.2)', fontSize:'0.72rem', color:'var(--tx2)', lineHeight:1.7 }}>
            🔐 <strong style={{color:'var(--mag)'}}>왜 안전한가?</strong> &nbsp; n에서 p, q를 역으로 찾는 것(소인수분해)이 수백 자리에서는 수천 년이 걸립니다. d를 모르면 복호화 불가능!
          </div>
        </div>

        {/* mod 개념 먼저 설명 */}
        <div style={{ background:'var(--bg-card)', border:'1px solid rgba(255,187,0,0.35)', padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, color:'var(--warn)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.6rem' }}>
            ⚡ 핵심 수학: mod (나머지 연산)
          </div>
          <p style={{ fontSize:'0.78rem', color:'var(--tx2)', lineHeight:1.85, marginBottom:'0.75rem' }}>
            RSA에서 가장 많이 나오는 <strong style={{color:'var(--tx)'}}>mod</strong>는 <strong style={{color:'var(--green)'}}>나눗셈의 나머지</strong>입니다.
          </p>
          <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.8rem', color:'var(--green)', background:'rgba(0,255,136,0.05)', borderLeft:'3px solid var(--warn)', padding:'0.6rem 1rem', lineHeight:2.1 }}>
            17 mod 5 = <strong>2</strong> &nbsp; (17 ÷ 5 = 3 ... 나머지 <strong>2</strong>)<br/>
            20 mod 6 = <strong>2</strong> &nbsp; (20 ÷ 6 = 3 ... 나머지 <strong>2</strong>)<br/>
            25 mod 12 = <strong>1</strong> &nbsp; (25 ÷ 12 = 2 ... 나머지 <strong>1</strong>)
          </div>
          <div style={{ marginTop:'0.6rem', fontSize:'0.72rem', color:'var(--warn)', fontFamily:'JetBrains Mono' }}>
            계산법: ① 앞수 ÷ 뒷수 = 몫(소수점 버림) &nbsp; ② 앞수 − (몫 × 뒷수) = 나머지
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'2.5rem' }}>
          {[
            { n:'01', title:'소인수분해',   color:'var(--step1)', formula:'n = p × q', desc:'공개키 n을 두 소수 p, q의 곱으로 분해합니다.' },
            { n:'02', title:'φ(n) 계산',    color:'var(--step2)', formula:'φ(n) = (p−1)(q−1)', desc:'오일러 피 함수로 개인키 생성에 필요한 값을 구합니다.' },
            { n:'03', title:'개인키 d 계산', color:'var(--step3)', formula:'e × d ≡ 1  (mod φ(n))', desc:'e×d를 φ(n)으로 나눈 나머지가 1이 되는 d를 찾습니다.' },
            { n:'04', title:'복호화',        color:'var(--step4)', formula:'m = c^d  mod  n', desc:'c를 d번 거듭제곱하고 n으로 나눈 나머지가 원본 메시지입니다.' },
          ].map(s => (
            <div key={s.n} style={{ display:'flex', gap:'1rem', alignItems:'center', background:'var(--bg-card)', border:`1px solid ${s.color}33`, padding:'0.9rem 1.25rem' }}>
              <span style={{ fontFamily:'Rajdhani', fontSize:'1.6rem', fontWeight:700, color:s.color, minWidth:'2.5rem', textShadow:`0 0 8px ${s.color}` }}>{s.n}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.2rem' }}>
                  <span style={{ fontFamily:'Rajdhani', fontSize:'0.9rem', fontWeight:700, color:'var(--tx)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{s.title}</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontSize:'0.78rem', color:'var(--green)' }}>{s.formula}</span>
                </div>
                <span style={{ fontSize:'0.72rem', color:'var(--tx2)' }}>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', display:'flex', gap:'0.75rem', justifyContent:'center' }}>
          <button onClick={() => setScene('puzzle')} style={{ padding:'0.85rem 2.5rem', background:'var(--cyan)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
            ▶ 훈련 시작
          </button>
          <button onClick={handleSkip} style={{ padding:'0.85rem 1.5rem', background:'transparent', color:'var(--tx2)', border:'1px solid var(--border)', fontFamily:'Rajdhani', fontSize:'0.9rem', cursor:'pointer' }}>
            건너뛰기
          </button>
        </div>
      </div>
    </div>
  )

  // ── 인터랙티브 퍼즐 ────────────────────────────────────────
  if (scene === 'puzzle') return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'2rem' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>
        {/* 헤더 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', letterSpacing:'0.25em', color:'var(--cyan)', marginBottom:'0.3rem' }}>// 훈련 미션</div>
            <h2 style={{ fontFamily:'Rajdhani', fontSize:'1.8rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--tx)', margin:0 }}>
              첫 번째 암호 해독
            </h2>
          </div>
          <button onClick={handleSkip} style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', color:'var(--tx3)', background:'transparent', border:'none', cursor:'pointer', letterSpacing:'0.1em' }}>
            건너뛰기
          </button>
        </div>

        {/* 공개키 패널 */}
        <div className="hud" style={{ padding:'1rem 1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'0.6rem', letterSpacing:'0.2em', color:'var(--tx3)', textTransform:'uppercase', marginBottom:'0.5rem' }}>공개키 (PUBLIC KEY) — 적에게 공개된 정보</div>
          <div style={{ display:'flex', gap:'2.5rem', flexWrap:'wrap' }}>
            {[['n',PUZZLE.n,'var(--cyan)'],['e',PUZZLE.e,'var(--cyan)'],['c (암호문)',PUZZLE.c,'var(--mag)']].map(([l,v,c]) => (
              <div key={String(l)}>
                <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.65rem', color:'var(--tx3)' }}>{l} =</div>
                <div style={{ fontFamily:'Rajdhani', fontSize:'1.6rem', fontWeight:700, color:String(c), textShadow:`0 0 10px ${c}` }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4단계 */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Step 1 */}
          <StepCard step={1} color="var(--step1)" title="소인수분해" formula={`${PUZZLE.n} = p × q  (p, q는 소수)`}>
            {!step1Done ? (
              <>
                <div style={{ fontSize:'0.72rem', color:'var(--warn)', marginBottom:'0.75rem' }}>
                  💡 힌트: {PUZZLE.n}을 두 소수의 곱으로 나눠보세요. (2, 3, 5, 7, 11 ...으로 나눠보기)
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono', color:'var(--tx2)' }}>{PUZZLE.n} =</span>
                  <TutInput value={p} onChange={v=>{setP(v);setErr1('')}} placeholder="p" correct={false} wrong={!!err1} />
                  <span style={{ color:'var(--tx2)' }}>×</span>
                  <TutInput value={q} onChange={v=>{setQ(v);setErr1('')}} placeholder="q" correct={false} wrong={!!err1} />
                  <button onClick={checkStep1} style={{ padding:'0.4rem 1.1rem', background:'var(--step1)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>제출</button>
                </div>
                {err1 && <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--mag)' }}>⚠ {err1}</div>}
              </>
            ) : (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)' }}>
                {PUZZLE.n} = <strong>{ANSWER.p}</strong> × <strong>{ANSWER.q}</strong> ✓
                <span style={{ marginLeft:'1rem', fontSize:'0.72rem', color:'var(--tx2)' }}>두 소수의 곱입니다!</span>
              </div>
            )}
          </StepCard>

          {/* Step 2 */}
          <StepCard step={2} color="var(--step2)" title="오일러 피 함수" formula="φ(n) = (p−1) × (q−1)">
            {!step1Done ? (
              <div style={{ color:'var(--tx3)', fontSize:'0.75rem', fontFamily:'JetBrains Mono' }}>🔒 Step 1 완료 후 해제됩니다</div>
            ) : !step2Done ? (
              <>
                <div style={{ fontSize:'0.72rem', color:'var(--warn)', marginBottom:'0.75rem' }}>
                  💡 힌트: p={ANSWER.p}, q={ANSWER.q}를 공식에 대입하세요. ({ANSWER.p}-1) × ({ANSWER.q}-1) = ?
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono', color:'var(--tx2)' }}>φ({PUZZLE.n}) =</span>
                  <TutInput value={phi} onChange={v=>{setPhi(v);setErr2('')}} placeholder="?" correct={false} wrong={!!err2} width="6rem" />
                  <button onClick={checkStep2} style={{ padding:'0.4rem 1.1rem', background:'var(--step2)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>제출</button>
                </div>
                {err2 && <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--mag)' }}>⚠ {err2}</div>}
              </>
            ) : (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)' }}>
                φ({PUZZLE.n}) = ({ANSWER.p}-1)×({ANSWER.q}-1) = <strong>{ANSWER.phi}</strong> ✓
              </div>
            )}
          </StepCard>

          {/* Step 3 */}
          <StepCard step={3} color="var(--step3)" title="개인키 d 계산" formula={`${PUZZLE.e} × d ≡ 1  (mod ${ANSWER.phi})`}>
            {!step2Done ? (
              <div style={{ color:'var(--tx3)', fontSize:'0.75rem', fontFamily:'JetBrains Mono' }}>🔒 Step 2 완료 후 해제됩니다</div>
            ) : !step3Done ? (
              <>
                <div style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.25)', padding:'0.75rem 1rem', marginBottom:'0.75rem', fontSize:'0.75rem', color:'var(--tx2)', lineHeight:1.85 }}>
                  <strong style={{color:'var(--warn)'}}>mod 계산법:</strong> 5×d 를 12로 나눈 <strong style={{color:'var(--green)'}}>나머지가 1</strong>이 되는 d를 찾습니다.<br/>
                  <span style={{fontFamily:'JetBrains Mono', fontSize:'0.72rem', color:'var(--green)'}}>
                    5×1=5 &nbsp; 5 mod 12 = <strong>5</strong> ✗<br/>
                    5×2=10 &nbsp; 10 mod 12 = <strong>10</strong> ✗<br/>
                    5×3=15 &nbsp; 15 mod 12 = <strong>3</strong> ✗&nbsp;(15-12=3)<br/>
                    5×4=20 &nbsp; 20 mod 12 = <strong>8</strong> ✗&nbsp;(20-12=8)<br/>
                    5×<strong style={{color:'#ffee44'}}>5</strong>=25 &nbsp; 25 mod 12 = <strong style={{color:'#ffee44'}}>1</strong> ✅ &nbsp;(25-2×12=1)
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono', color:'var(--tx2)' }}>d =</span>
                  <TutInput value={d} onChange={v=>{setD(v);setErr3('')}} placeholder="?" correct={false} wrong={!!err3} width="5rem" />
                  <button onClick={checkStep3} style={{ padding:'0.4rem 1.1rem', background:'var(--step3)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>제출</button>
                </div>
                {err3 && <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--mag)' }}>⚠ {err3}</div>}
              </>
            ) : (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)' }}>
                d = <strong>{ANSWER.d}</strong> &nbsp; ({PUZZLE.e}×{ANSWER.d}={PUZZLE.e*ANSWER.d}={Math.floor(PUZZLE.e*ANSWER.d/ANSWER.phi)}×{ANSWER.phi}+1 ✓)
              </div>
            )}
          </StepCard>

          {/* Step 4 */}
          <StepCard step={4} color="var(--step4)" title="복호화" formula={`m = ${PUZZLE.c}^${ANSWER.d}  mod  ${PUZZLE.n}`}>
            {!step3Done ? (
              <div style={{ color:'var(--tx3)', fontSize:'0.75rem', fontFamily:'JetBrains Mono' }}>🔒 Step 3 완료 후 해제됩니다</div>
            ) : !step4Done ? (
              <>
                <div style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.25)', padding:'0.75rem 1rem', marginBottom:'0.75rem', fontSize:'0.75rem', color:'var(--tx2)', lineHeight:1.85 }}>
                  <strong style={{color:'var(--step4)'}}>mod 계산법:</strong> {PUZZLE.c}를 {ANSWER.d}번 곱하고 {PUZZLE.n}으로 나눈 나머지를 구합니다.<br/>
                  <strong style={{color:'var(--warn)', fontSize:'0.72rem'}}>중간마다 mod를 취하면 숫자가 작아져 계산이 쉬워집니다!</strong><br/>
                  <span style={{fontFamily:'JetBrains Mono', fontSize:'0.72rem', color:'var(--green)'}}>
                    {PUZZLE.c}^1 mod {PUZZLE.n} = <strong>{PUZZLE.c}</strong><br/>
                    {PUZZLE.c}^2 mod {PUZZLE.n} = {PUZZLE.c*PUZZLE.c} mod {PUZZLE.n} = <strong>{PUZZLE.c*PUZZLE.c % PUZZLE.n}</strong><br/>
                    {PUZZLE.c}^4 mod {PUZZLE.n} = {PUZZLE.c*PUZZLE.c % PUZZLE.n}^2 mod {PUZZLE.n} = <strong>{(PUZZLE.c*PUZZLE.c%PUZZLE.n)**2 % PUZZLE.n}</strong><br/>
                    {PUZZLE.c}^5 mod {PUZZLE.n} = {PUZZLE.c}^4 × {PUZZLE.c}^1 mod {PUZZLE.n} = {(PUZZLE.c*PUZZLE.c%PUZZLE.n)**2%PUZZLE.n}×{PUZZLE.c} mod {PUZZLE.n} = <strong style={{color:'#ffee44'}}>{(PUZZLE.c*PUZZLE.c%PUZZLE.n)**2%PUZZLE.n*PUZZLE.c%PUZZLE.n}</strong> ✅
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'JetBrains Mono', color:'var(--tx2)' }}>m =</span>
                  <TutInput value={m} onChange={v=>{setM(v);setErr4('')}} placeholder="?" correct={false} wrong={!!err4} width="5rem" />
                  <button onClick={checkStep4} style={{ padding:'0.4rem 1.1rem', background:'var(--step4)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>제출</button>
                </div>
                {err4 && <div style={{ marginTop:'0.5rem', fontSize:'0.72rem', color:'var(--mag)' }}>⚠ {err4}</div>}
              </>
            ) : (
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.9rem', color:'var(--green)' }}>
                m = <strong style={{ fontSize:'1.2rem', textShadow:'0 0 10px var(--green)' }}>{ANSWER.m}</strong> ✓ 암호 해독 성공!
              </div>
            )}
          </StepCard>
        </div>
      </div>
    </div>
  )

  // ── 완료 화면 ──────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ maxWidth:560, width:'100%', textAlign:'center' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem', filter:'drop-shadow(0 0 16px var(--green))' }}>
          <PixelChar skinId="skin_cipher" scale={7} />
        </div>

        <div style={{ fontFamily:'Rajdhani', fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:700, letterSpacing:'0.2em', color:'var(--green)', textShadow:'0 0 20px var(--green)', marginBottom:'0.5rem' }}>
          🔓 MISSION CLEAR
        </div>
        <div style={{ fontFamily:'JetBrains Mono', fontSize:'0.82rem', color:'var(--tx2)', lineHeight:1.8, marginBottom:'2rem' }}>
          첫 번째 RSA 암호 해독에 성공했습니다, 요원.<br />
          이 원리가 바로 인터넷 보안을 지탱하는 수학입니다.
        </div>

        {/* 보상 */}
        <div style={{ display:'inline-flex', gap:'2rem', background:'var(--bg-panel)', border:'1px solid rgba(0,255,136,0.3)', padding:'1rem 2rem', marginBottom:'2rem' }}>
          <div>
            <div style={{ fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.2em', textTransform:'uppercase' }}>보상</div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1.4rem', fontWeight:700, color:'#ffd700' }}>+200 💰</div>
          </div>
          <div>
            <div style={{ fontSize:'0.58rem', color:'var(--tx3)', letterSpacing:'0.2em', textTransform:'uppercase' }}>배지</div>
            <div style={{ fontFamily:'Rajdhani', fontSize:'1.4rem', fontWeight:700, color:'var(--cyan)' }}>
              <PixelIcon name="medal" scale={3} color="var(--cyan)" />
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center' }}>
          <button onClick={finish} style={{ padding:'0.85rem 2.5rem', background:'var(--green)', color:'var(--bg)', border:'none', fontFamily:'Rajdhani', fontSize:'1rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', clipPath:'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
            ▶ 스테이지 시작
          </button>
        </div>
      </div>
    </div>
  )
}
