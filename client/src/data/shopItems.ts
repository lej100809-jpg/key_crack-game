export type ShopCategory = 'skin' | 'title' | 'consumable' | 'challenge'

export interface ShopItem {
  id:        string
  name:      string
  desc:      string
  price:     number
  category:  ShopCategory
  icon:      string
  stackable?: boolean
  value?:    number
}

// ── 에이전트 스킨 ────────────────────────────────────────────
export interface AgentSkin {
  id:          string
  name:        string
  class:       string       // 클래스 명칭
  price:       number
  free:        boolean
  // 비주얼
  primary:     string       // 메인 컬러
  secondary:   string       // 보조 컬러
  bg:          string       // 카드 배경
  pattern:     string       // 'grid' | 'circuit' | 'hex' | 'glitch' | 'void' | 'flame'
  glowColor:   string
  // 게임 내 적용
  cssVars: {
    '--cyan':      string
    '--cyan-dim':  string
    '--cyan-glow': string
    '--mag':       string
    '--mag-dim':   string
    '--mag-glow':  string
  }
}

function mkSkin(id: string, name: string, cls: string, price: number, free: boolean,
  pri: string, sec: string, bg: string, pat: string, glow: string,
  cyan: string, cyD: string, cyG: string, mag: string, mgD: string, mgG: string): AgentSkin {
  return { id, name, class: cls, price, free, primary: pri, secondary: sec, bg, pattern: pat,
    glowColor: glow, cssVars: { '--cyan':cyan,'--cyan-dim':cyD,'--cyan-glow':cyG,'--mag':mag,'--mag-dim':mgD,'--mag-glow':mgG } }
}

export const AGENT_SKINS: AgentSkin[] = [
  mkSkin('skin_cipher',  'CIPHER',  'Default Agent',      0,    true,  '#00d4ff','#ff2d78','#080d1a','grid',    'rgba(0,212,255,0.5)',  '#00d4ff','rgba(0,212,255,0.22)','rgba(0,212,255,0.12)','#ff2d78','rgba(255,45,120,0.22)','rgba(255,45,120,0.12)'),
  mkSkin('skin_ghost',   'GHOST',   'Stealth Operative',  400,  false, '#b0b8cc','#445566','#050608','void',    'rgba(180,188,204,0.4)','#b0b8cc','rgba(176,184,204,0.22)','rgba(176,184,204,0.1)','#6688aa','rgba(102,136,170,0.22)','rgba(102,136,170,0.1)'),
  mkSkin('skin_matrix',  'MATRIX',  'System Breaker',     500,  false, '#00ff41','#00cc33','#001a00','circuit', 'rgba(0,255,65,0.5)',   '#00ff41','rgba(0,255,65,0.22)', 'rgba(0,255,65,0.12)', '#00cc33','rgba(0,204,51,0.22)',  'rgba(0,204,51,0.12)'),
  mkSkin('skin_phantom', 'PHANTOM', 'Void Walker',        600,  false, '#aa44ff','#ff44aa','#0a0014','hex',     'rgba(170,68,255,0.5)', '#aa44ff','rgba(170,68,255,0.22)','rgba(170,68,255,0.12)','#ff44aa','rgba(255,68,170,0.22)','rgba(255,68,170,0.12)'),
  mkSkin('skin_crimson', 'CRIMSON', 'Assault Hacker',     600,  false, '#ff3355','#ff8800','#1a0004','flame',   'rgba(255,51,85,0.5)',  '#ff3355','rgba(255,51,85,0.22)', 'rgba(255,51,85,0.12)', '#ff8800','rgba(255,136,0,0.22)', 'rgba(255,136,0,0.12)'),
  mkSkin('skin_golden',  'GOLDEN',  'Legend',             2000, false, '#ffd700','#ffaa00','#110d00','grid',    'rgba(255,215,0,0.6)',  '#ffd700','rgba(255,215,0,0.22)', 'rgba(255,215,0,0.12)', '#ff9900','rgba(255,153,0,0.22)', 'rgba(255,153,0,0.12)'),
  mkSkin('skin_storm',   'STORM',   'Thunder Knight',     700,  false, '#88ddff','#ffee44','#050a14','grid',    'rgba(136,221,255,0.5)','#88ddff','rgba(136,221,255,0.22)','rgba(136,221,255,0.12)','#ffee44','rgba(255,238,68,0.22)','rgba(255,238,68,0.12)'),
  mkSkin('skin_neon',    'NEON',    'Neon Dancer',        500,  false, '#ff44aa','#aa44ff','#180010','hex',     'rgba(255,68,170,0.5)', '#ff44aa','rgba(255,68,170,0.22)', 'rgba(255,68,170,0.12)', '#aa44ff','rgba(170,68,255,0.22)','rgba(170,68,255,0.12)'),
  mkSkin('skin_ice',     'ICE',     'Frost Mage',         550,  false, '#88ccee','#aaddff','#020810','void',    'rgba(136,204,238,0.5)','#88ccee','rgba(136,204,238,0.22)','rgba(136,204,238,0.12)','#4499bb','rgba(68,153,187,0.22)','rgba(68,153,187,0.12)'),
  mkSkin('skin_shadow',  'SHADOW',  'Dark Assassin',      650,  false, '#9944cc','#440066','#08000f','void',    'rgba(153,68,204,0.5)', '#9944cc','rgba(153,68,204,0.22)', 'rgba(153,68,204,0.12)', '#440066','rgba(68,0,102,0.22)',  'rgba(68,0,102,0.12)'),
  mkSkin('skin_omega',   'OMEGA',   'Omega Destroyer',    1500, false, '#ff2200','#880000','#150000','flame',   'rgba(255,34,0,0.5)',   '#ff2200','rgba(255,34,0,0.22)',  'rgba(255,34,0,0.12)',  '#880000','rgba(136,0,0,0.22)',   'rgba(136,0,0,0.12)'),
  mkSkin('skin_circuit', 'CIRCUIT', 'Circuit Breaker',    600,  false, '#ff7700','#ffaa00','#150800','circuit', 'rgba(255,119,0,0.5)',  '#ff7700','rgba(255,119,0,0.22)', 'rgba(255,119,0,0.12)', '#ffaa00','rgba(255,170,0,0.22)', 'rgba(255,170,0,0.12)'),
  mkSkin('skin_virus',   'VIRUS',   'Virus Agent',        550,  false, '#44cc00','#88ff00','#031400','circuit', 'rgba(68,204,0,0.5)',   '#44cc00','rgba(68,204,0,0.22)',  'rgba(68,204,0,0.12)',  '#88ff00','rgba(136,255,0,0.22)', 'rgba(136,255,0,0.12)'),
  mkSkin('skin_angel',   'ANGEL',   'Holy Guardian',      1000, false, '#ffffcc','#aaddff','#101014','void',    'rgba(255,255,204,0.5)','#ffffcc','rgba(255,255,204,0.22)','rgba(255,255,204,0.1)','#aaddff','rgba(170,221,255,0.22)','rgba(170,221,255,0.1)'),
  mkSkin('skin_demon',   'DEMON',   'Chaos Bringer',      1200, false, '#cc0000','#ff4422','#100000','flame',   'rgba(204,0,0,0.5)',    '#cc0000','rgba(204,0,0,0.22)',   'rgba(204,0,0,0.12)',   '#ff4422','rgba(255,68,34,0.22)', 'rgba(255,68,34,0.12)'),
  mkSkin('skin_ninja',   'NINJA',   'Silent Blade',       800,  false, '#aabbcc','#667788','#030305','void',    'rgba(170,187,204,0.4)','#aabbcc','rgba(170,187,204,0.22)','rgba(170,187,204,0.1)','#667788','rgba(102,119,136,0.22)','rgba(102,119,136,0.1)'),
  mkSkin('skin_knight',  'KNIGHT',  'Iron Sentinel',      700,  false, '#99aabb','#556677','#080c10','grid',    'rgba(153,170,187,0.5)','#99aabb','rgba(153,170,187,0.22)','rgba(153,170,187,0.12)','#556677','rgba(85,102,119,0.22)','rgba(85,102,119,0.12)'),
  mkSkin('skin_wizard',  'WIZARD',  'Arcane Scholar',     650,  false, '#4488ff','#2244bb','#030718','hex',     'rgba(68,136,255,0.5)', '#4488ff','rgba(68,136,255,0.22)', 'rgba(68,136,255,0.12)', '#2244bb','rgba(34,68,187,0.22)', 'rgba(34,68,187,0.12)'),
  mkSkin('skin_hunter',  'HUNTER',  'Field Operative',    400,  false, '#88aa44','#556622','#070a04','grid',    'rgba(136,170,68,0.5)', '#88aa44','rgba(136,170,68,0.22)', 'rgba(136,170,68,0.12)', '#556622','rgba(85,102,34,0.22)', 'rgba(85,102,34,0.12)'),
  mkSkin('skin_cyber',   'CYBER',   'Cyber Idol',         900,  false, '#ff44cc','#cc0099','#150010','circuit', 'rgba(255,68,204,0.5)', '#ff44cc','rgba(255,68,204,0.22)', 'rgba(255,68,204,0.12)', '#cc0099','rgba(204,0,153,0.22)', 'rgba(204,0,153,0.12)'),
]

// ── 칭호 ─────────────────────────────────────────────────────
export const TITLES: ShopItem[] = [
  { id:'title_novice',  name:'[NOVICE]',  icon:'🔰', price:100,  category:'title', desc:'초보 요원의 칭호.' },
  { id:'title_hacker',  name:'[HACKER]',  icon:'💻', price:300,  category:'title', desc:'시스템을 뚫는 해커.' },
  { id:'title_breaker', name:'[BREAKER]', icon:'⚡', price:500,  category:'title', desc:'암호를 부수는 자.' },
  { id:'title_cipher',  name:'[CIPHER]',  icon:'🔐', price:800,  category:'title', desc:'암호 그 자체가 된 요원.' },
  { id:'title_ghost',   name:'[GHOST]',   icon:'👻', price:1200, category:'title', desc:'흔적도 없이 침투하는 유령.' },
  { id:'title_legend',  name:'[LEGEND]',  icon:'👑', price:2000, category:'title', desc:'전설적인 암호 해독 마스터.' },
]

// ── 소모품 ───────────────────────────────────────────────────
export const CONSUMABLES: ShopItem[] = [
  { id:'hint_x1',     name:'긴급 힌트 ×1',  icon:'💡',      price:80,  category:'consumable', stackable:true, value:1,  desc:'힌트 1회 추가. 난이도 제한 없음.' },
  { id:'hint_x3',     name:'힌트 묶음 ×3',  icon:'💡💡💡', price:210, category:'consumable', stackable:true, value:3,  desc:'힌트 3회. 단품보다 30코인 절약.' },
  { id:'time_extend', name:'시간 연장 +45초',icon:'⏳',      price:150, category:'consumable', stackable:true, value:45, desc:'제한 시간 +45초. 타이머 있는 모드 전용.' },
  { id:'revive',      name:'부활권',         icon:'💎',      price:350, category:'consumable', stackable:true, value:1,  desc:'시간 초과 실패 시 타이머 절반으로 재시작.' },
]

// ── 특수 도전 ────────────────────────────────────────────────
export const CHALLENGES: ShopItem[] = [
  { id:'challenge_speed',     name:'SPEED RUN VAULT', icon:'⚡', price:500,  category:'challenge', desc:'97이하 소수, 45초, 힌트 0회. 클리어 시 1500코인.' },
  { id:'challenge_blind',     name:'BLIND VAULT',     icon:'🙈', price:800,  category:'challenge', desc:'e 값을 숨긴 극한 모드. 최상위 난이도.' },
  { id:'challenge_nightmare', name:'NIGHTMARE ×20',   icon:'💀', price:2000, category:'challenge', desc:'Expert 20연속. 실패하면 처음부터. 클리어 5000코인.' },
]

export function getSkin(id: string): AgentSkin {
  return AGENT_SKINS.find(s => s.id === id) ?? AGENT_SKINS[0]
}
